'use client';

import { useActionState } from 'react';
import { loginAction } from '@/app/actions/auth';
import { LogIn } from 'lucide-react';

const initialState = {
  message: '',
  errors: {},
};

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {state.message && (
        <div className="p-4 bg-rejected-bg border border-rejected/20 rounded-lg flex items-start">
          <p className="text-sm font-medium text-rejected">{state.message}</p>
        </div>
      )}
      
      <div className="space-y-1">
        <label className="block text-sm font-semibold text-text-primary" htmlFor="username">
          Username
        </label>
        <input 
          id="username"
          name="username"
          type="text" 
          autoComplete="username"
          className={`cms-input ${state.errors?.username ? 'error' : ''}`}
          placeholder="Enter your username"
        />
        {state.errors?.username && (
          <p className="mt-1 text-xs text-rejected font-medium">{state.errors.username[0]}</p>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-text-primary" htmlFor="password">
            Password
          </label>
        </div>
        <input 
          id="password"
          name="password"
          type="password" 
          autoComplete="current-password"
          className={`cms-input ${state.errors?.password ? 'error' : ''}`}
          placeholder="••••••••"
        />
        {state.errors?.password && (
          <p className="mt-1 text-xs text-rejected font-medium">{state.errors.password[0]}</p>
        )}
      </div>

      <button 
        type="submit" 
        disabled={isPending}
        className="w-full flex justify-center items-center gap-2 bg-primary hover:bg-primary-light text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg mt-8"
      >
        {isPending ? (
          <>
            <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            <span>Signing in...</span>
          </>
        ) : (
          <>
            <LogIn className="h-5 w-5" />
            <span>Sign In</span>
          </>
        )}
      </button>

      {/* For demo purposes, since there's no reset password flow yet */}
      <div className="text-center mt-6">
        <p className="text-xs text-text-muted">
          Default admin: <span className="font-mono bg-surface-raised px-1 py-0.5 rounded">admin</span> / <span className="font-mono bg-surface-raised px-1 py-0.5 rounded">Admin@123</span>
        </p>
      </div>
    </form>
  );
}
