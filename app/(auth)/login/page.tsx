import LoginForm from './login-form';
import { ShieldCheck, Lock, Activity, BarChart3, Users } from 'lucide-react';

export const metadata = {
  title: 'Secure Access | Portal',
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex bg-white font-sans">
      {/* ── LEFT PANEL: Branding & Value Props (Hidden on mobile) ── */}
      <div className="hidden lg:flex w-1/2 bg-[#0B1120] relative overflow-hidden flex-col justify-between p-12 xl:p-20 border-r border-slate-800">
        {/* Abstract Background Effects */}
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-20%] w-[60%] h-[60%] rounded-full bg-blue-600/20 blur-[100px]" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} 
        />

        {/* Top Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3.5 mb-20">
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 border border-white/10">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-display font-extrabold text-white tracking-tight">LAS Portal</span>
          </div>

          <div className="space-y-6 max-w-lg">
            <h1 className="text-4xl xl:text-5xl font-display font-bold text-white leading-[1.15]">
              Enterprise Credit <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                Management System
              </span>
            </h1>
            <p className="text-slate-400 text-lg font-medium leading-relaxed">
              Secure, streamlined, and intelligent lending operations. Access your dashboard to manage proposals, track workflows, and analyze risk.
            </p>
          </div>
        </div>

        {/* Bottom Value Props */}
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-4 text-slate-300 bg-white/[0.03] p-4 rounded-2xl backdrop-blur-md border border-white/5 w-max hover:bg-white/[0.05] transition-colors">
            <div className="h-10 w-10 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <Activity className="h-5 w-5 text-indigo-400" />
            </div>
            <span className="text-sm font-semibold tracking-wide pr-4">Real-time Risk Analytics</span>
          </div>
          
          <div className="flex items-center gap-4 text-slate-300 bg-white/[0.03] p-4 rounded-2xl backdrop-blur-md border border-white/5 w-max ml-8 hover:bg-white/[0.05] transition-colors">
            <div className="h-10 w-10 rounded-lg bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
              <BarChart3 className="h-5 w-5 text-cyan-400" />
            </div>
            <span className="text-sm font-semibold tracking-wide pr-4">Comprehensive Reporting</span>
          </div>
          
          <div className="flex items-center gap-4 text-slate-300 bg-white/[0.03] p-4 rounded-2xl backdrop-blur-md border border-white/5 w-max ml-16 hover:bg-white/[0.05] transition-colors">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <Users className="h-5 w-5 text-emerald-400" />
            </div>
            <span className="text-sm font-semibold tracking-wide pr-4">Role-based Access Control</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Login Form ── */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-24 relative bg-white">
        <div className="w-full max-w-[400px] space-y-8">
          
          {/* Mobile Logo (Visible only on small screens) */}
          <div className="lg:hidden flex flex-col items-center text-center mb-8">
            <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
              <ShieldCheck className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight">
              LAS Portal
            </h2>
          </div>

          {/* Form Header */}
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-display font-extrabold text-slate-900 tracking-tight">
              Welcome back
            </h2>
            <p className="text-slate-500 mt-2 text-sm font-medium">
              Please enter your credentials to access your account.
            </p>
          </div>

          {/* Client Form Component */}
          <LoginForm />

          {/* Security Footer */}
          <div className="pt-8 mt-8 border-t border-slate-100 flex flex-col items-center lg:items-start gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200">
              <Lock className="h-3 w-3 text-slate-500" />
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">
                End-to-End Encrypted
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Protected by bank-grade security protocols.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
