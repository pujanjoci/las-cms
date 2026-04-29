'use server';

import { supabase } from '@/lib/db';
import { hashPassword, requireAuth } from '@/lib/auth';
import { PERMISSIONS, requirePermission, hasRole } from '@/lib/rbac';
import { revalidatePath } from 'next/cache';

export async function createUserAction(formData: FormData) {
  try {
    // 1. Authorize the action
    const session = await requireAuth();
    requirePermission(session, PERMISSIONS.USER_MANAGE);

    // 2. Extract and validate form data
    const full_name = formData.get('full_name') as string;
    const email = formData.get('email') as string;
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const branch = formData.get('branch') as string;
    const designation = formData.get('designation') as string;
    const role_id = formData.get('role_id') as string;

    if (!full_name || !email || !username || !password || !role_id) {
      return { error: 'Please fill in all required fields.' };
    }

    // 2.5. RBAC Strict Check: Only super_admin can create admin/super_admin
    const isSuperAdmin = hasRole(session, 'super_admin');
    const { data: roleData } = await supabase
      .from('roles')
      .select('name')
      .eq('id', parseInt(role_id, 10))
      .single();

    if (roleData) {
      if ((roleData.name === 'admin' || roleData.name === 'super_admin') && !isSuperAdmin) {
        return { error: 'Forbidden: You do not have permission to create Admin or Super Admin accounts.' };
      }
    }

    // 3. Hash the password
    const password_hash = hashPassword(password);

    // 4. Insert User
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        username,
        email,
        password_hash,
        full_name,
        branch: branch || null,
        designation: designation || null,
        is_active: 1
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error creating user:', insertError);
      if (insertError.code === '23505') {
        return { error: 'Username or email already exists.' };
      }
      return { error: 'Failed to create user. Please try again.' };
    }

    // 5. Assign Role
    if (newUser) {
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: newUser.id,
          role_id: parseInt(role_id, 10),
          assigned_by: session.id === 9999 ? null : session.id
        });

      if (roleError) {
        console.error('Error assigning role:', roleError);
        return { error: 'User created, but failed to assign role.' };
      }
    }

    // 6. Revalidate the users page cache
    revalidatePath('/settings/users');
    return { success: true };

  } catch (err: any) {
    console.error('createUserAction error:', err);
    return { error: err.message || 'An unexpected error occurred.' };
  }
}

export async function deleteUserAction(userId: number) {
  try {
    // 1. Authorize the action
    const session = await requireAuth();
    
    // STRICT RBAC: Only super_admin can delete users
    if (!hasRole(session, 'super_admin')) {
      return { error: 'Forbidden: Only Super Administrators can delete users.' };
    }

    // Protect against self-deletion
    if (session.id === userId) {
      return { error: 'Forbidden: You cannot delete your own active account.' };
    }

    // 2. Delete User
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user:', error);
      return { error: 'Failed to delete user.' };
    }

    // 3. Revalidate the cache
    revalidatePath('/settings/users');
    return { success: true };

  } catch (err: any) {
    console.error('deleteUserAction error:', err);
    return { error: err.message || 'An unexpected error occurred.' };
  }
}

export async function editUserAction(userId: number, formData: FormData) {
  try {
    // 1. Authorize the action
    const session = await requireAuth();
    requirePermission(session, PERMISSIONS.USER_MANAGE);
    const isSuperAdmin = hasRole(session, 'super_admin');

    // 2. Extract form data
    const full_name = formData.get('full_name') as string;
    const email = formData.get('email') as string;
    const username = formData.get('username') as string;
    const password = formData.get('password') as string; // Optional
    const branch = formData.get('branch') as string;
    const designation = formData.get('designation') as string;
    const role_id = formData.get('role_id') as string;
    const is_active = formData.get('is_active') === 'on' ? 1 : 0;

    if (!full_name || !email || !username || !role_id) {
      return { error: 'Please fill in all required fields.' };
    }

    // 3. Fetch the target user's current roles
    const { data: targetRoleRows } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', userId);
      
    const targetRoles = (targetRoleRows || []).map((row: any) => row.roles?.name).filter(Boolean);
    const isTargetAdmin = targetRoles.includes('admin') || targetRoles.includes('super_admin');

    // 4. RBAC Check: Regular admins cannot edit admin/super_admin users
    if (isTargetAdmin && !isSuperAdmin) {
      return { error: 'Forbidden: You do not have permission to modify Admin or Super Admin accounts.' };
    }

    // 5. RBAC Check: Regular admins cannot assign admin/super_admin roles
    const { data: roleData } = await supabase
      .from('roles')
      .select('name')
      .eq('id', parseInt(role_id, 10))
      .single();

    if (roleData && (roleData.name === 'admin' || roleData.name === 'super_admin') && !isSuperAdmin) {
      return { error: 'Forbidden: You do not have permission to assign Admin or Super Admin roles.' };
    }

    // 6. Prepare update payload
    const updatePayload: any = {
      username,
      email,
      full_name,
      branch: branch || null,
      designation: designation || null,
      is_active,
      updated_at: new Date().toISOString()
    };

    // 7. Handle optional password hash
    if (password && password.trim().length > 0) {
      updatePayload.password_hash = hashPassword(password);
    }

    // 8. Update User
    const { error: updateError } = await supabase
      .from('users')
      .update(updatePayload)
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user:', updateError);
      if (updateError.code === '23505') {
        return { error: 'Username or email already exists.' };
      }
      return { error: 'Failed to update user. Please try again.' };
    }

    // 9. Update Role Assignment
    // We'll delete existing roles and insert the new one
    await supabase.from('user_roles').delete().eq('user_id', userId);
    
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role_id: parseInt(role_id, 10),
        assigned_by: session.id === 9999 ? null : session.id
      });

    if (roleError) {
      console.error('Error assigning role during update:', roleError);
      return { error: 'User updated, but failed to re-assign role.' };
    }

    // 10. Revalidate the cache
    revalidatePath('/settings/users');
    return { success: true };

  } catch (err: any) {
    console.error('editUserAction error:', err);
    return { error: err.message || 'An unexpected error occurred.' };
  }
}


