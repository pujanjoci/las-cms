import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/db';
import { requirePermission, PERMISSIONS } from '@/lib/rbac';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { EditUserForm } from './edit-user-form';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Edit User',
};

// Next.js 15 requires awaiting params
export default async function EditUserPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getSession();
  if (!session) return null;
  
  requirePermission(session, PERMISSIONS.USER_MANAGE);
  const isSuperAdmin = session.roles.includes('super_admin');
  const targetUserId = parseInt(params.id, 10);

  if (isNaN(targetUserId)) {
    return notFound();
  }

  // Fetch the target user's details
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*, user_roles!user_roles_user_id_fkey(roles(id, name))')
    .eq('id', targetUserId)
    .single();

  if (userError || !user) {
    return notFound();
  }

  const targetRoles = (user.user_roles as any[])?.map(ur => ur.roles?.name).filter(Boolean) || [];
  const isTargetAdmin = targetRoles.includes('admin') || targetRoles.includes('super_admin');

  // RBAC check on page load: regular admins can't edit super admins
  if (isTargetAdmin && !isSuperAdmin) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
          <h2 className="font-bold">Access Denied</h2>
          <p className="text-sm mt-1">You do not have permission to edit Administrator accounts.</p>
          <Link href="/settings/users" className="text-sm font-bold text-red-600 underline mt-3 inline-block">
            Return to User Management
          </Link>
        </div>
      </div>
    );
  }

  // Fetch available roles for the dropdown
  const { data: roles } = await supabase
    .from('roles')
    .select('id, name')
    .order('id', { ascending: true });

  // Determine current role ID
  const currentRoleId = (user.user_roles as any[])?.[0]?.roles?.id || '';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/settings/users" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors mb-4 font-bold">
          <ArrowLeft className="h-4 w-4" />
          Back to User Management
        </Link>
        <h1 className="text-2xl font-display font-bold text-primary text-blue-900">Edit User</h1>
        <p className="text-sm text-slate-500 mt-1">Update account details, role assignments, or reset the password.</p>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-border p-6 md:p-8">
        <EditUserForm 
          user={user} 
          currentRoleId={currentRoleId} 
          roles={roles || []} 
          isSuperAdmin={isSuperAdmin} 
        />
      </div>
    </div>
  );
}
