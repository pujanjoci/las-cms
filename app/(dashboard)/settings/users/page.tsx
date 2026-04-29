import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/db';
import { requirePermission, PERMISSIONS } from '@/lib/rbac';
import { StatusBadge } from '@/components/ui/status-badge';
import { Users, UserPlus, Mail, Shield, Building, Clock, Edit2 } from 'lucide-react';
import Link from 'next/link';
import { DeleteUserButton } from './delete-user-button';

export const metadata = {
  title: 'User Management',
};

export default async function UsersPage() {
  const session = await getSession();
  if (!session) return null;
  
  requirePermission(session, PERMISSIONS.USER_MANAGE);
  const isSuperAdmin = session.roles.includes('super_admin');

  // Fetch all users with their roles
  const { data: users, error } = await supabase
    .from('users')
    .select(`
      *,
      user_roles!user_roles_user_id_fkey (
        roles (
          name
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-primary text-blue-900">User Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage system users, roles, and access permissions.</p>
        </div>
        <Link href="/settings/users/new" className="bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add New User
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="cms-table w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-border">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">User Details</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Branch & Dept</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Role</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Last Login</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(!users || users.length === 0) ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">No users found in the database.</td>
                </tr>
              ) : (
                users.map((u) => {
                  const roles = (u.user_roles as any[])?.map(ur => ur.roles?.name).filter(Boolean) || [];
                  const isUserAdminOrSuper = roles.includes('admin') || roles.includes('super_admin');
                  const canEdit = isSuperAdmin || !isUserAdminOrSuper;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-primary font-bold">
                            {u.full_name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-primary">{u.full_name}</p>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                              <Mail className="h-3 w-3" />
                              {u.email}
                            </div>
                            <p className="text-[10px] font-mono text-slate-400">@{u.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                            <Building className="h-3 w-3 text-slate-400" />
                            {u.branch || 'N/A'}
                          </div>
                          <div className="text-[11px] text-slate-500 italic pl-4">
                            {u.designation || 'Staff'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {roles.length > 0 ? (
                            roles.map(r => (
                              <span key={r} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100 uppercase">
                                <Shield className="h-2.5 w-2.5" />
                                {r.replace('_', ' ')}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 italic">No Role Assigned</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={u.is_active ? 'active' : 'inactive'} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          {u.last_login ? new Date(u.last_login).toLocaleString() : 'Never'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          {canEdit ? (
                            <Link 
                              href={`/settings/users/${u.id}/edit`}
                              className="text-xs font-bold flex items-center gap-1 transition-colors w-fit text-accent hover:text-accent-dark"
                              title="Edit User"
                            >
                              <Edit2 className="h-3 w-3" />
                              Edit
                            </Link>
                          ) : (
                            <button 
                              disabled
                              className="text-xs font-bold flex items-center gap-1 transition-colors w-fit text-slate-300 cursor-not-allowed"
                              title="Only Super Admins can edit admin accounts"
                            >
                              <Edit2 className="h-3 w-3" />
                              Edit
                            </button>
                          )}

                          {isSuperAdmin && (
                            <DeleteUserButton userId={u.id} userName={u.full_name} />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
