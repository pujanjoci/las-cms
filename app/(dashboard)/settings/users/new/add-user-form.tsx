'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserAction } from '@/app/actions/user';
import { Loader2, AlertCircle } from 'lucide-react';

type AddUserFormProps = {
  roles: { id: number; name: string }[];
  isSuperAdmin: boolean;
};

export function AddUserForm({ roles, isSuperAdmin }: AddUserFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError(null);
    
    const result = await createUserAction(formData);
    
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
            placeholder="Jane Doe"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Email Address</label>
          <input 
            type="email" 
            name="email" 
            required 
            placeholder="jane@bank.com.np"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Username</label>
          <input 
            type="text" 
            name="username" 
            required 
            placeholder="janedoe"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Password</label>
          <input 
            type="password" 
            name="password" 
            required 
            placeholder="••••••••"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Branch</label>
          <select 
            name="branch" 
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
            placeholder="e.g. Credit Officer"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-bold text-slate-700">System Role</label>
          <select 
            name="role_id" 
            required
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
          <p className="text-xs text-slate-500 font-medium mt-1.5">
            This determines the user's access level and permissions across the system.
          </p>
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
              Creating User...
            </>
          ) : (
            'Create User'
          )}
        </button>
      </div>
    </form>
  );
}
