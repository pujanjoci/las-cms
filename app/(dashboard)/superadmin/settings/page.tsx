import { getSession } from '@/lib/auth';
import { Settings, Database, Shield, Server, RefreshCw } from 'lucide-react';

export const metadata = { title: 'System Settings — CreditAppraise' };

export default async function SystemSettingsPage() {
  const session = await getSession();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-800">System Settings</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">Super Admin — System configuration and maintenance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { icon: Database, title: 'Database', desc: 'Supabase PostgreSQL', status: 'Connected', statusColor: 'text-emerald-600 bg-emerald-50' },
          { icon: Shield, title: 'Authentication', desc: 'JWT + bcryptjs', status: 'Active', statusColor: 'text-emerald-600 bg-emerald-50' },
          { icon: Server, title: 'Storage', desc: 'Supabase Buckets', status: 'Not Configured', statusColor: 'text-amber-600 bg-amber-50' },
          { icon: RefreshCw, title: 'Cache', desc: 'React cache() + ISR', status: 'Enabled', statusColor: 'text-emerald-600 bg-emerald-50' },
        ].map((item) => (
          <div key={item.title} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{item.title}</p>
                  <p className="text-xs text-slate-400 font-medium">{item.desc}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${item.statusColor}`}>
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-800">Environment</h2>
        </div>
        <div className="p-6 space-y-3">
          {[
            { key: 'NEXT_PUBLIC_SUPABASE_URL', value: '••••••••.supabase.co' },
            { key: 'SUPABASE_SERVICE_ROLE_KEY', value: '••••••••••••' },
            { key: 'SESSION_SECRET', value: '••••••••••••' },
            { key: 'NODE_ENV', value: process.env.NODE_ENV || 'development' },
          ].map((env) => (
            <div key={env.key} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
              <span className="font-mono text-xs text-slate-500 font-bold">{env.key}</span>
              <span className="font-mono text-xs text-slate-400">{env.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
