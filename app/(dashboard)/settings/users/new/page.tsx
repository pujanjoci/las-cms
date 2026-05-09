import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/db';
import { requirePermission, PERMISSIONS } from '@/lib/rbac';
import Link from 'next/link';
import { ArrowLeft, UserPlus, Info } from 'lucide-react';
import { AddUserForm } from './add-user-form';

export const metadata = {
  title: 'Add New User',
};

export default async function AddUserPage() {
  const session = await getSession();
  if (!session) return null;
  
  requirePermission(session, PERMISSIONS.USER_MANAGE);
  const isSuperAdmin = session.roles.includes('super_admin');

  // Fetch available roles
  const { data: roles } = await supabase
    .from('roles')
    .select('id, name')
    .order('id', { ascending: true });

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
            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <UserPlus className="h-5.5 w-5.5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-display font-extrabold text-slate-900 tracking-tight">
                Add New User
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Create a new user account and assign system permissions.
              </p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mx-6 sm:mx-8 mt-6 p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100/80 flex items-start gap-3">
          <Info className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-indigo-700/80 font-medium leading-relaxed">
            New users will receive system access based on their assigned role. All passwords are securely hashed before storage.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          <AddUserForm roles={roles || []} isSuperAdmin={isSuperAdmin} />
        </div>
      </div>
    </div>
  );
}
