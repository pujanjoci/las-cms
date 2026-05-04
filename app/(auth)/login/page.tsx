import LoginForm from './login-form';
import { ShieldCheck, Lock } from 'lucide-react';

export const metadata = {
  title: 'Secure Access | Portal',
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F8FAFC] relative overflow-hidden font-sans">
      {/* Decorative background elements for "WOW" factor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
      
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #4F46E5 1px, transparent 0)', backgroundSize: '32px 32px' }} 
      />
      
      <div className="relative z-10 w-full max-w-[440px] px-4">
        <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden border border-slate-100 p-1">
          <div className="bg-white rounded-[1.8rem] border border-slate-50 p-8 sm:p-12">
            <div className="flex flex-col items-center text-center mb-10">
              <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center mb-6 shadow-lg shadow-primary/20 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                <ShieldCheck className="h-9 w-9 text-white" />
              </div>
              <h1 className="text-3xl font-display font-extrabold text-slate-900 tracking-tight">
                Secure Portal
              </h1>
              <p className="text-slate-500 mt-3 text-[0.95rem] font-medium leading-relaxed max-w-[280px]">
                Access the Credit Management System dashboard
              </p>
            </div>
            
            <LoginForm />
          </div>
        </div>
        
        <div className="mt-10 flex flex-col items-center gap-4 transition-all duration-1000">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white shadow-sm border border-slate-100">
            <Lock className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
              End-to-End Encrypted
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium opacity-60">
            Authorized Personnel Access Only
          </p>
        </div>
      </div>
    </main>
  );
}
