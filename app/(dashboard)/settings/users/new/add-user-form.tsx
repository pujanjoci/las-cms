'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserAction } from '@/app/actions/user';
import { Loader2, AlertCircle, User, Mail, KeyRound, Building, Briefcase, Hash, Shield, Check } from 'lucide-react';

type AddUserFormProps = {
  roles: { id: number; name: string }[];
  isSuperAdmin: boolean;
};

const inputClass = `w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50/50 text-slate-900 text-sm font-medium placeholder:text-slate-300 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all duration-200`;

const labelClass = `block text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.1em] mb-2 ml-0.5`;

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
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2 duration-200">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700 font-semibold">{error}</p>
        </div>
      )}

      {/* Section: Identity */}
      <div>
        <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black">1</span>
          Identity
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass} htmlFor="add-full-name">Full Name</label>
            <div className="relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors"><User className="h-4.5 w-4.5" /></div>
              <input id="add-full-name" type="text" name="full_name" required placeholder="Jane Doe" className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass} htmlFor="add-email">Email Address</label>
            <div className="relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors"><Mail className="h-4.5 w-4.5" /></div>
              <input id="add-email" type="email" name="email" required placeholder="jane@bank.com.np" className={inputClass} />
            </div>
          </div>
        </div>
      </div>

      {/* Section: Credentials */}
      <div>
        <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black">2</span>
          Credentials
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass} htmlFor="add-username">Username</label>
            <div className="relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors"><User className="h-4.5 w-4.5" /></div>
              <input id="add-username" type="text" name="username" required placeholder="janedoe" className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass} htmlFor="add-password">Password</label>
            <div className="relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors"><KeyRound className="h-4.5 w-4.5" /></div>
              <input id="add-password" type="password" name="password" required placeholder="••••••••" className={inputClass} />
            </div>
          </div>
        </div>
      </div>

      {/* Section: Organization */}
      <div>
        <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black">3</span>
          Organization
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass} htmlFor="add-branch">Branch</label>
            <div className="relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors"><Building className="h-4.5 w-4.5" /></div>
              <select id="add-branch" name="branch" className={`${inputClass} appearance-none`}>
                <option value="">Select Branch...</option>
                <option value="Head Office">Head Office</option>
                <option value="Kathmandu Branch">Kathmandu Branch</option>
                <option value="Lalitpur Branch">Lalitpur Branch</option>
                <option value="Pokhara Branch">Pokhara Branch</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass} htmlFor="add-designation">Designation</label>
            <div className="relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors"><Briefcase className="h-4.5 w-4.5" /></div>
              <input id="add-designation" type="text" name="designation" placeholder="e.g. Credit Officer" className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass} htmlFor="add-emp-code">Employee Code</label>
            <div className="relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors"><Hash className="h-4.5 w-4.5" /></div>
              <input id="add-emp-code" type="text" name="employee_code" placeholder="EMP-123456 (auto-generated if blank)" className={inputClass} />
            </div>
          </div>
        </div>
      </div>

      {/* Section: Access Control */}
      <div>
        <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black">4</span>
          Access Control
        </h3>
        <div>
          <label className={labelClass} htmlFor="add-role">System Role</label>
          <div className="relative group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors"><Shield className="h-4.5 w-4.5" /></div>
            <select id="add-role" name="role_id" required className={`${inputClass} appearance-none`}>
              <option value="">Select a role to assign...</option>
              {roles
                .filter(role => isSuperAdmin || (role.name !== 'admin' && role.name !== 'super_admin'))
                .map(role => (
                <option key={role.id} value={role.id}>
                  {role.name.replace(/_/g, ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-2 ml-0.5">
            This determines the user&apos;s access level and permissions across the system.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push('/settings/users')}
          className="px-6 py-3 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all duration-200"
          disabled={isPending}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="group bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl text-sm font-bold transition-all duration-200 shadow-lg shadow-primary/20 hover:shadow-primary/30 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 hover:-translate-y-0.5 active:translate-y-0"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating User...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 transition-transform group-hover:scale-110" />
              Create User
            </>
          )}
        </button>
      </div>
    </form>
  );
}
