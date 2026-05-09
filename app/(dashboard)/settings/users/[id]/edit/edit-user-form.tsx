'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { editUserAction } from '@/app/actions/user';
import { Loader2, AlertCircle, User, Mail, KeyRound, Building, Briefcase, Hash, Shield, Save } from 'lucide-react';

type EditUserFormProps = {
  user: any;
  currentRoleId: number | string;
  roles: { id: number; name: string }[];
  isSuperAdmin: boolean;
};

const inputClass = `w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50/50 text-slate-900 text-sm font-medium placeholder:text-slate-300 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all duration-200`;

const labelClass = `block text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.1em] mb-2 ml-0.5`;

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
            <label className={labelClass} htmlFor="edit-full-name">Full Name</label>
            <div className="relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors"><User className="h-4.5 w-4.5" /></div>
              <input id="edit-full-name" type="text" name="full_name" required defaultValue={user.full_name} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass} htmlFor="edit-email">Email Address</label>
            <div className="relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors"><Mail className="h-4.5 w-4.5" /></div>
              <input id="edit-email" type="email" name="email" required defaultValue={user.email} className={inputClass} />
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
            <label className={labelClass} htmlFor="edit-username">Username</label>
            <div className="relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors"><User className="h-4.5 w-4.5" /></div>
              <input id="edit-username" type="text" name="username" required defaultValue={user.username} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass} htmlFor="edit-password">
              Reset Password <span className="text-slate-300 font-bold normal-case tracking-normal">(Optional)</span>
            </label>
            <div className="relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors"><KeyRound className="h-4.5 w-4.5" /></div>
              <input id="edit-password" type="password" name="password" placeholder="Leave blank to keep unchanged" className={inputClass} />
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
            <label className={labelClass} htmlFor="edit-branch">Branch</label>
            <div className="relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors"><Building className="h-4.5 w-4.5" /></div>
              <select id="edit-branch" name="branch" defaultValue={user.branch || ''} className={`${inputClass} appearance-none`}>
                <option value="">Select Branch...</option>
                <option value="Head Office">Head Office</option>
                <option value="Kathmandu Branch">Kathmandu Branch</option>
                <option value="Lalitpur Branch">Lalitpur Branch</option>
                <option value="Pokhara Branch">Pokhara Branch</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass} htmlFor="edit-designation">Designation</label>
            <div className="relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors"><Briefcase className="h-4.5 w-4.5" /></div>
              <input id="edit-designation" type="text" name="designation" defaultValue={user.designation || ''} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass} htmlFor="edit-emp-code">Employee Code</label>
            <div className="relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors"><Hash className="h-4.5 w-4.5" /></div>
              <input id="edit-emp-code" type="text" name="employee_code" defaultValue={user.employee_code || ''} placeholder="e.g. EMP-123456" className={inputClass} />
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
          <label className={labelClass} htmlFor="edit-role">System Role</label>
          <div className="relative group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors"><Shield className="h-4.5 w-4.5" /></div>
            <select id="edit-role" name="role_id" required defaultValue={currentRoleId} className={`${inputClass} appearance-none`}>
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
        </div>

        {/* Account Active Toggle */}
        <div className="mt-6 p-4 rounded-xl bg-slate-50/70 border border-slate-100">
          <label className="flex items-center gap-4 cursor-pointer">
            <div className="relative flex-shrink-0">
              <input 
                type="checkbox" 
                name="is_active" 
                defaultChecked={user.is_active === 1}
                className="peer sr-only" 
              />
              <div className="block h-7 w-12 rounded-full bg-slate-200 peer-checked:bg-emerald-500 transition-colors duration-200"></div>
              <div className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 peer-checked:translate-x-5"></div>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Account Active</p>
              <p className="text-[11px] text-slate-500 mt-0.5">If disabled, the user will be unable to sign in to the portal.</p>
            </div>
          </label>
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
              Saving Changes...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 transition-transform group-hover:scale-110" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}
