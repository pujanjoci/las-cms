'use client';

import { useState, useEffect } from 'react';
import { 
  Search, Plus, Filter, MoreHorizontal, 
  Mail, Phone, Building2, Shield, 
  CheckCircle2, XCircle, Key, Smartphone,
  Lock, X, Check, Loader2, Save, AlertCircle
} from 'lucide-react';

interface User {
  id: string;
  employee_code: string;
  full_name: string;
  email: string;
  phone: string;
  dept_id: string;
  dept_name: string;
  status: 'active' | 'inactive' | 'suspended';
  mfa_enabled: boolean;
  last_login_at: string | null;
  roles: any[];
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Password Change State
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [modalMessage, setModalMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newPassword) return;

    setUpdatingPassword(true);
    setModalMessage(null);

    try {
      const res = await fetch(`/api/users/${selectedUser.id}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to update password');

      setModalMessage({ type: 'success', text: 'Password updated successfully!' });
      setTimeout(() => {
        setSelectedUser(null);
        setNewPassword('');
        setModalMessage(null);
      }, 2000);
    } catch (error: any) {
      setModalMessage({ type: 'error', text: error.message });
    } finally {
      setUpdatingPassword(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.employee_code && u.employee_code.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">User Management</h1>
          <p className="text-slate-500 mt-1">Manage system access, department assignments, and security.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
            <Filter size={20} />
            <span>Filter</span>
          </button>
          <button className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-indigo-100 active:scale-95">
            <Plus size={20} />
            <span>New User</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, email or employee code..." 
              className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
             <button className="text-sm font-bold text-primary hover:underline">Download Template</button>
             <button className="text-sm font-bold bg-white text-slate-700 border border-slate-200 rounded-xl px-4 py-2 hover:bg-slate-50 shadow-sm">Bulk Import</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-[11px] font-black uppercase tracking-[0.1em] text-slate-400 border-b border-slate-100">
                <th className="px-8 py-5">User Details</th>
                <th className="px-8 py-5">Department</th>
                <th className="px-8 py-5">Roles</th>
                <th className="px-8 py-5">Security</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-6"><div className="h-10 w-48 bg-slate-100 rounded-xl" /></td>
                    <td className="px-8 py-6"><div className="h-7 w-28 bg-slate-100 rounded-full" /></td>
                    <td className="px-8 py-6"><div className="h-7 w-36 bg-slate-100 rounded-full" /></td>
                    <td className="px-8 py-6"><div className="h-7 w-20 bg-slate-100 rounded" /></td>
                    <td className="px-8 py-6"><div className="h-7 w-20 bg-slate-100 rounded-full" /></td>
                    <td className="px-8 py-6 text-right"><div className="h-10 w-10 bg-slate-100 rounded-xl ml-auto" /></td>
                  </tr>
                ))
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-primary font-black text-sm shadow-sm group-hover:scale-110 transition-transform">
                          {user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-primary transition-colors">{user.full_name}</div>
                          <div className="text-xs text-slate-500 font-medium flex items-center gap-2 mt-0.5">
                            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">{user.employee_code || 'EMP-N/A'}</span>
                            <span className="text-slate-300">•</span>
                            <span>{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 shadow-sm">
                        <Building2 size={14} className="text-primary" />
                        {user.dept_name || 'Unassigned'}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-wrap gap-1.5">
                        {user.roles && user.roles.length > 0 ? (
                          user.roles.map((role, i) => (
                            <span key={i} className="px-2.5 py-1 bg-indigo-50 text-primary border border-indigo-100 rounded-lg text-[10px] font-black uppercase tracking-tight">
                              {role.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">No roles</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-1.5 ${user.mfa_enabled ? 'text-emerald-500' : 'text-slate-300'}`}>
                          <Smartphone size={16} />
                          <span className="text-[10px] font-black uppercase">MFA</span>
                        </div>
                        {!user.roles?.some((r: any) => r.name === 'super_admin') && (
                          <button 
                            onClick={() => setSelectedUser(user)}
                            className="text-slate-400 hover:text-primary transition-colors p-1"
                            title="Change Password"
                          >
                            <Lock size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-2.5 hover:bg-white rounded-xl text-slate-400 hover:text-slate-900 transition-all border border-transparent hover:border-slate-200 shadow-none hover:shadow-sm">
                        <MoreHorizontal size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                         <Search className="text-slate-300" size={32} />
                      </div>
                      <p className="text-slate-500 font-bold">No users found</p>
                      <p className="text-slate-400 text-sm">Try adjusting your search terms</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Change Password Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-900/20 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 text-primary rounded-2xl">
                  <Lock size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Change Password</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">Updating credentials for {selectedUser.full_name}</p>
                </div>
              </div>
              <button 
                onClick={() => { setSelectedUser(null); setModalMessage(null); }}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="p-8 space-y-6">
              {modalMessage && (
                <div className={`p-4 rounded-xl border flex items-center gap-3 ${
                  modalMessage.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'
                }`}>
                  {modalMessage.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                  <p className="text-sm font-bold">{modalMessage.text}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">New Secure Password</label>
                <input 
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoFocus
                />
                <p className="text-[10px] text-slate-400 font-medium ml-1">Min. 6 characters. Use a combination of letters and symbols.</p>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => { setSelectedUser(null); setModalMessage(null); }}
                  className="flex-1 px-6 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={updatingPassword || !newPassword}
                  className="flex-1 px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {updatingPassword ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  <span>{updatingPassword ? 'Updating...' : 'Set Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: 'active' | 'inactive' | 'suspended' }) {
  const styles = {
    active: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    inactive: 'bg-slate-50 text-slate-400 border-slate-100',
    suspended: 'bg-rose-50 text-rose-600 border-rose-100',
  };

  return (
    <span className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${styles[status]}`}>
      {status}
    </span>
  );
}
