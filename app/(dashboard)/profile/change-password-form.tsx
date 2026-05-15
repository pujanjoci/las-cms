'use client';

import { useActionState } from 'react';
import { Save } from 'lucide-react';
import { changePasswordAction } from '@/app/actions/profile';

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(changePasswordAction, null);

  return (
    <form action={formAction} className="space-y-4 max-w-md">
      {state?.error && (
        <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-medium">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="p-3 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl text-sm font-medium">
          {state.message}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
        <input 
          type="password" 
          name="current_password"
          required
          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          placeholder="Enter current password"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
        <input 
          type="password" 
          name="new_password"
          required
          minLength={8}
          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          placeholder="Minimum 8 characters"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
        <input 
          type="password" 
          name="confirm_password"
          required
          minLength={8}
          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          placeholder="Confirm new password"
        />
      </div>

      <div className="pt-2">
        <button 
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-medium text-sm shadow-sm disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isPending ? 'Updating...' : 'Update Password'}
        </button>
      </div>
    </form>
  );
}
