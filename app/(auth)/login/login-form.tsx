import { useState, useActionState } from 'react';
import { loginAction } from '@/app/actions/auth';
import { LogIn, User, KeyRound, AlertCircle, Eye, EyeOff } from 'lucide-react';

const initialState = {
  message: '',
  errors: {},
};

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-6 mt-8">
      {state.message && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 transition-all duration-300 animate-in slide-in-from-top-2">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm font-semibold text-red-700 leading-relaxed">{state.message}</p>
        </div>
      )}
      
      <div className="space-y-2">
        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.1em] ml-1" htmlFor="username">
          Username
        </label>
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors duration-200">
            <User className="h-5 w-5" />
          </div>
          <input 
            id="username"
            name="username"
            type="text" 
            autoComplete="username"
            required
            className={`w-full pl-12 pr-4 py-3.5 bg-slate-50/80 border-2 rounded-xl text-slate-900 placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all duration-300 outline-none text-sm font-medium ${state.errors?.username ? 'border-red-200 focus:border-red-300 focus:ring-red-50' : 'border-slate-100 focus:border-primary'}`}
            placeholder="e.g. admin"
          />
        </div>
        {state.errors?.username && (
          <p className="mt-1.5 text-xs text-red-500 font-bold ml-1">{state.errors.username[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.1em] ml-1" htmlFor="password">
          Password
        </label>
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors duration-200">
            <KeyRound className="h-5 w-5" />
          </div>
          <input 
            id="password"
            name="password"
            type={showPassword ? "text" : "password"} 
            autoComplete="current-password"
            required
            className={`w-full pl-12 pr-12 py-3.5 bg-slate-50/80 border-2 rounded-xl text-slate-900 placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all duration-300 outline-none text-sm font-medium ${state.errors?.password ? 'border-red-200 focus:border-red-300 focus:ring-red-50' : 'border-slate-100 focus:border-primary'}`}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors duration-200 focus:outline-none"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {state.errors?.password && (
          <p className="mt-1.5 text-xs text-red-500 font-bold ml-1">{state.errors.password[0]}</p>
        )}
      </div>

      <button 
        type="submit" 
        disabled={isPending}
        className="w-full group bg-primary hover:bg-primary-dark text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 focus:ring-4 focus:ring-primary/20 active:translate-y-0 mt-2 flex items-center justify-center gap-3"
      >
        {isPending ? (
          <>
            <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            <span>Authenticating...</span>
          </>
        ) : (
          <>
            <span>Sign In to Dashboard</span>
            <LogIn className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
          </>
        )}
      </button>
    </form>
  );
}
