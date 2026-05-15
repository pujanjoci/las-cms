'use server';

import { supabase } from '@/lib/db';
import { hashPassword, verifyPassword, requireAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function updateAvatarAction(prevState: any, formData: FormData) {
  try {
    const session = await requireAuth();
    const file = formData.get('avatar') as File;

    if (!file || file.size === 0) {
      return { error: 'Please select an image file.' };
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return { error: 'Only image files are allowed.' };
    }

    // Validate file size (e.g., max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { error: 'Image size must be less than 5MB.' };
    }

    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${session.id}_${Date.now()}.${fileExt}`;
    const filePath = `${session.id}/${fileName}`; // Group by user ID

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('user-avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('Avatar upload error:', uploadError);
      return { error: 'Failed to upload image. Make sure the avatars bucket exists and policies are set.' };
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('user-avatars')
      .getPublicUrl(filePath);

    const avatarUrl = publicUrlData.publicUrl;

    // Update user profile in database
    const { error: updateError } = await supabase
      .from('users')
      .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
      .eq('id', session.id);

    if (updateError) {
      console.error('Database update error:', updateError);
      return { error: 'Failed to update user profile.' };
    }

    revalidatePath('/', 'layout'); // Revalidate everything to update topbar
    return { success: true, message: 'Avatar updated successfully.' };

  } catch (error) {
    console.error('Update avatar error:', error);
    return { error: 'An unexpected error occurred.' };
  }
}

export async function changePasswordAction(prevState: any, formData: FormData) {
  try {
    const session = await requireAuth();
    
    // Test admin account bypass (cannot change password)
    if (session.id.toString() === '9999') {
        return { error: 'Cannot change password for the demo Test Admin account.' };
    }

    const currentPassword = formData.get('current_password') as string;
    const newPassword = formData.get('new_password') as string;
    const confirmPassword = formData.get('confirm_password') as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return { error: 'Please fill in all password fields.' };
    }

    if (newPassword !== confirmPassword) {
      return { error: 'New passwords do not match.' };
    }

    if (newPassword.length < 8) {
      return { error: 'New password must be at least 8 characters long.' };
    }

    // Fetch user's current password hash
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', session.id)
      .single();

    if (fetchError || !user) {
      return { error: 'Failed to verify user credentials.' };
    }

    // Verify current password
    if (!verifyPassword(currentPassword, user.password_hash)) {
      return { error: 'Incorrect current password.' };
    }

    // Hash new password
    const newPasswordHash = hashPassword(newPassword);

    // Update password in database
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        password_hash: newPasswordHash, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', session.id);

    if (updateError) {
      console.error('Password update error:', updateError);
      return { error: 'Failed to update password.' };
    }

    return { success: true, message: 'Password changed successfully.' };

  } catch (error) {
    console.error('Change password error:', error);
    return { error: 'An unexpected error occurred.' };
  }
}
