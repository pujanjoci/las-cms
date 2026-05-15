import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/db';
import { requirePermission, PERMISSIONS } from '@/lib/rbac';
import { StatusBadge } from '@/components/ui/status-badge';
import { Users, UserPlus, Mail, Shield, Building, Clock, Edit2, Search, Hash, ChevronRight } from 'lucide-react';
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

  // Fetch users, user_roles, and roles in parallel (flat queries — no FK joins)
  const [usersRes, userRolesRes, rolesRes] = await Promise.all([
    supabase.from('users').select('*').order('created_at', { ascending: false }),
    supabase.from('user_roles').select('user_id, role_id'),
    supabase.from('roles').select('*'),
  ]);

  if (usersRes.error) console.error('Error fetching users:', JSON.stringify(usersRes.error));
  if (userRolesRes.error) console.error('Error fetching user_roles:', JSON.stringify(userRolesRes.error));
  if (rolesRes.error) console.error('Error fetching roles:', JSON.stringify(rolesRes.error));

  // Build role lookup: role_id → role name
  const roleLookup: Record<string | number, string> = {};
  for (const r of rolesRes.data || []) {
    // Try common column names: name, role_name, role_code
    roleLookup[r.id] = r.name || r.role_name || r.role_code || `Role #${r.id}`;
  }

  // Build user → role names map
  const roleMap: Record<string, string[]> = {};
  for (const ur of userRolesRes.data || []) {
    const userId = String(ur.user_id);
    const roleName = roleLookup[ur.role_id];
    if (roleName) {
      if (!roleMap[userId]) roleMap[userId] = [];
      roleMap[userId].push(roleName);
    }
  }

  // Merge roles into user objects
  const allUsers = (usersRes.data || []).map(u => ({
    ...u,
    _roles: roleMap[u.id] || [],
  }));

  // Hide super_admin users from regular admins
  // Fallback: if role data failed to load, use username/role-name heuristic
  const rolesLoaded = !userRolesRes.error && !rolesRes.error;
  const users = isSuperAdmin 
    ? allUsers 
    : allUsers.filter(u => {
        // Primary check: role-based filtering
        if (u._roles.includes('super_admin')) return false;
        // Fallback when roles data couldn't be loaded — hide obvious super_admin accounts
        if (!rolesLoaded && (u.username === 'superadmin' || u.username === 'super_admin')) return false;
        return true;
      });

  const totalUsers = users?.length || 0;
  const activeUsers = users?.filter(u => u.is_active === 1 || u.is_active === true).length || 0;
  const inactiveUsers = totalUsers - activeUsers;

  return (
    <div className="space-y-8">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight">
              User Management
            </h1>
          </div>
          <p className="text-sm text-slate-500 ml-[3.25rem]">
            Manage system users, roles, and access permissions across the portal.
          </p>
        </div>
        <Link 
          href="/settings/users/new" 
          className="group inline-flex items-center gap-2.5 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0"
        >
          <UserPlus className="h-4 w-4 transition-transform group-hover:scale-110" />
          Add New User
        </Link>
      </div>

      {/* ── Stats Summary Row ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <Users className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{totalUsers}</p>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Total Users</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <Shield className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{activeUsers}</p>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Active</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
            <Clock className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{inactiveUsers}</p>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Inactive</p>
          </div>
        </div>
      </div>

      {/* ── Users Table ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Table Header Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            All System Users
          </p>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
            {totalUsers} {totalUsers === 1 ? 'Record' : 'Records'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-3.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-400">User Details</th>
                <th className="px-6 py-3.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-400">Branch & Dept</th>
                <th className="px-6 py-3.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-400">Role</th>
                <th className="px-6 py-3.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-400">Status</th>
                <th className="px-6 py-3.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-400">Last Login</th>
                <th className="px-6 py-3.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(!users || users.length === 0) ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center">
                        <Users className="h-7 w-7 text-slate-300" />
                      </div>
                      <p className="text-sm font-bold text-slate-400">No users found</p>
                      <p className="text-xs text-slate-400">Create a new user to get started.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const roles = u._roles || [];
                  const isUserAdminOrSuper = roles.includes('admin') || roles.includes('super_admin');
                  const canEdit = isSuperAdmin || !isUserAdminOrSuper;

                  return (
                    <tr key={u.id} className="group hover:bg-primary/[0.015] transition-colors duration-150">
                      {/* User Details */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary font-extrabold text-sm tracking-tight flex-shrink-0 border border-primary/10">
                            {u.full_name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">{u.full_name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Mail className="h-3 w-3 text-slate-400 flex-shrink-0" />
                              <span className="text-xs text-slate-500 truncate">{u.email}</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Hash className="h-3 w-3 text-slate-300 flex-shrink-0" />
                              <span className="text-[10px] font-mono text-slate-400 tracking-wide">{u.employee_code || u.username}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Branch & Designation */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <Building className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-xs font-semibold text-slate-700">{u.branch || 'N/A'}</span>
                          </div>
                          <span className="text-[11px] text-slate-500 pl-5">{u.designation || 'Staff'}</span>
                        </div>
                      </td>

                      {/* Roles */}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {roles.length > 0 ? (
                            roles.map((r: string) => (
                              <span 
                                key={r} 
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/5 text-primary text-[10px] font-bold border border-primary/10 uppercase tracking-wider"
                              >
                                <Shield className="h-2.5 w-2.5" />
                                {r.replace(/_/g, ' ')}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 italic">No Role</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <StatusBadge status={u.is_active === 1 || u.is_active === true ? 'active' : 'inactive'} />
                      </td>

                      {/* Last Login */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                          <span>{u.last_login ? new Date(u.last_login).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never'}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {canEdit ? (
                            <Link 
                              href={`/settings/users/${u.id}/edit`}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-dark bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-all duration-200"
                              title="Edit User"
                            >
                              <Edit2 className="h-3 w-3" />
                              Edit
                            </Link>
                          ) : (
                            <button 
                              disabled
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 bg-slate-50 px-3 py-1.5 rounded-lg cursor-not-allowed"
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
