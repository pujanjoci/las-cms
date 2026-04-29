import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/db';
import { requirePermission, PERMISSIONS } from '@/lib/rbac';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
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
      <div>
        <Link href="/settings/users" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors mb-4 font-bold">
          <ArrowLeft className="h-4 w-4" />
          Back to User Management
        </Link>
        <h1 className="text-2xl font-display font-bold text-primary text-blue-900">Add New User</h1>
        <p className="text-sm text-slate-500 mt-1">Create a new user account and assign permissions.</p>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-border p-6 md:p-8">
        <AddUserForm roles={roles || []} isSuperAdmin={isSuperAdmin} />
      </div>
    </div>
  );
}
