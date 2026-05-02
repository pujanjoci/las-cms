'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { editUserAction } from '@/app/actions/user';
import { Loader2, AlertCircle } from 'lucide-react';

type EditUserFormProps = {
  user: any;
  currentRoleId: number | string;
  roles: { id: number; name: string }[];
  isSuperAdmin: boolean;
};

export function EditUserForm({ user, currentRoleId, roles, isSuperAdmin }: EditUserFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Using bind to pass the userId to the server action
  const updateAction = editUserAction.bind(null, user.id);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError(null);
    
    const result = await updateAction(formData);
    
    if (result.error) {
      setError(result.error);
      setIsPending(false);
    } else {
      router.push('/settings/users');
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <p className="text-sm text-red-800 font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Full Name</label>
          <input 
            type="text" 
            name="full_name" 
            required 
            defaultValue={user.full_name}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Email Address</label>
          <input 
            type="email" 
            name="email" 
            required 
            defaultValue={user.email}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Username</label>
          <input 
            type="text" 
            name="username" 
            required 
            defaultValue={user.username}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">
            Reset Password <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <input 
            type="password" 
            name="password" 
            placeholder="Leave blank to keep unchanged"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Branch</label>
          <select 
            name="branch" 
            defaultValue={user.branch || ''}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium appearance-none"
          >
            <option value="">Select Branch...</option>
            <option value="Head Office">Head Office</option>
            <option value="Kathmandu Branch">Kathmandu Branch</option>
            <option value="Lalitpur Branch">Lalitpur Branch</option>
            <option value="Pokhara Branch">Pokhara Branch</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Designation</label>
          <input 
            type="text" 
            name="designation" 
            defaultValue={user.designation || ''}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Employee Code</label>
          <input 
            type="text" 
            name="employee_code" 
            defaultValue={user.employee_code || ''}
            placeholder="e.g. EMP-123456"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium"
          />
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-bold text-slate-700">System Role</label>
          <select 
            name="role_id" 
            required
            defaultValue={currentRoleId}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium appearance-none"
          >
            <option value="">Select a role to assign...</option>
            {roles
              .filter(role => isSuperAdmin || (role.name !== 'admin' && role.name !== 'super_admin'))
              .map(role => (
              <option key={role.id} value={role.id}>
                {role.name.replace('_', ' ').toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 md:col-span-2 py-4 border-t border-slate-100">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input 
                type="checkbox" 
                name="is_active" 
                defaultChecked={user.is_active === 1}
                className="peer sr-only" 
              />
              <div className="block h-6 w-10 rounded-full bg-slate-200 peer-checked:bg-emerald-500 transition-colors"></div>
              <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-4"></div>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Account Active</p>
              <p className="text-xs text-slate-500">If disabled, the user will not be able to log in.</p>
            </div>
          </label>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push('/settings/users')}
          className="px-6 py-2.5 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          disabled={isPending}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="bg-primary hover:bg-primary-light text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving Changes...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </form>
  );
}
