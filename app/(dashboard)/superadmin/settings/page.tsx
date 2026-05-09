import { getSession } from '@/lib/auth';
import { Settings, Database, Shield, Server, RefreshCw, Terminal } from 'lucide-react';

export const metadata = { title: 'System Settings — Portal' };

export default async function SystemSettingsPage() {
  const session = await getSession();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight">
            System Settings
          </h1>
        </div>
        <p className="text-sm text-slate-500 ml-[3.25rem]">
          Super Admin — System configuration, environment variables, and maintenance.
        </p>
      </div>

      {/* ── Status Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[
          { icon: Database, title: 'Database', desc: 'Supabase PostgreSQL', status: 'Connected', statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
          { icon: Shield, title: 'Authentication', desc: 'JWT + bcryptjs', status: 'Active', statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
          { icon: Server, title: 'Storage', desc: 'Supabase Buckets', status: 'Not Configured', statusColor: 'text-amber-700 bg-amber-50 border-amber-100' },
          { icon: RefreshCw, title: 'Cache', desc: 'React cache() + ISR', status: 'Enabled', statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
        ].map((item) => (
          <div key={item.title} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
                  <item.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{item.desc}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${item.statusColor}`}>
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Environment Variables ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-transparent flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
            <Terminal className="h-4 w-4 text-slate-600" />
          </div>
          <h2 className="text-sm font-bold text-slate-900">Environment Configuration</h2>
        </div>
        <div className="p-0">
          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-slate-50">
              {[
                { key: 'NEXT_PUBLIC_SUPABASE_URL', value: '••••••••.supabase.co' },
                { key: 'SUPABASE_SERVICE_ROLE_KEY', value: '••••••••••••' },
                { key: 'SESSION_SECRET', value: '••••••••••••' },
                { key: 'NODE_ENV', value: process.env.NODE_ENV || 'development' },
              ].map((env) => (
                <tr key={env.key} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 w-1/3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px] font-bold tracking-wider">
                      {env.key}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs text-slate-500">{env.value}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
