import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/db';
import { requirePermission, PERMISSIONS } from '@/lib/rbac';
import Link from 'next/link';
import { ArrowLeft, Edit2, ShieldAlert, Info } from 'lucide-react';
import { EditUserForm } from './edit-user-form';
import { notFound, redirect } from 'next/navigation';

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
  const targetUserId = params.id;

  if (!targetUserId) {
    redirect('/dashboard');
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
        <Link 
          href="/settings/users" 
          className="group inline-flex items-center gap-2 text-sm text-slate-400 hover:text-primary transition-colors font-bold"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to User Management
        </Link>
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-red-50 flex items-center justify-center">
              <ShieldAlert className="h-7 w-7 text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-display font-extrabold text-slate-900">Access Denied</h2>
              <p className="text-sm text-slate-500 mt-1.5">You do not have permission to edit Administrator accounts.</p>
            </div>
            <Link 
              href="/settings/users" 
              className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-dark bg-primary/5 hover:bg-primary/10 px-5 py-2.5 rounded-xl transition-all"
            >
              Return to User Management
            </Link>
          </div>
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
      {/* Back Navigation */}
      <Link 
        href="/settings/users" 
        className="group inline-flex items-center gap-2 text-sm text-slate-400 hover:text-primary transition-colors font-bold"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Back to User Management
      </Link>

      {/* Page Header Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-slate-100 bg-gradient-to-r from-primary/[0.03] to-transparent">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary font-extrabold text-lg flex-shrink-0 border border-primary/10">
              {user.full_name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-display font-extrabold text-slate-900 tracking-tight">
                Edit User
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Editing <span className="font-bold text-slate-700">{user.full_name}</span> — {user.employee_code || user.username}
              </p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mx-6 sm:mx-8 mt-6 p-3.5 rounded-xl bg-amber-50/60 border border-amber-100/80 flex items-start gap-3">
          <Info className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-700/80 font-medium leading-relaxed">
            Changes to role assignments take effect immediately on the user&apos;s next session. Leave the password field blank to keep it unchanged.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          <EditUserForm 
            user={user} 
            currentRoleId={currentRoleId} 
            roles={roles || []} 
            isSuperAdmin={isSuperAdmin} 
          />
        </div>
      </div>
    </div>
  );
}
