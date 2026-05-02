import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/db';
import { requirePermission, PERMISSIONS } from '@/lib/rbac';
import { 
  History, User, Activity, Calendar, 
  Search, Filter, ArrowUpRight, Database 
} from 'lucide-react';
import { format } from 'date-fns';

export const metadata = {
  title: 'Audit Trails',
};

export default async function AuditTrailsPage() {
  const session = await getSession();
  if (!session) return null;
  
  requirePermission(session, PERMISSIONS.SETTINGS_MANAGE);

  // Fetch logs with actor details
  const { data: logs, error } = await supabase
    .from('audit_logs')
    .select(`
      *,
      users (
        full_name,
        username
      )
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching audit logs:', error);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-primary text-blue-900">Audit Trails</h1>
          <p className="text-sm text-slate-500 mt-1">Monitor system activities and data changes in real-time.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search logs..." 
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all w-64"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
            <Filter className="h-4 w-4" />
            Filter
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-border">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Timestamp</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Actor</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Action</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Entity</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Changes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(!logs || logs.length === 0) ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <History className="h-8 w-8 text-slate-200" />
                      <p>No audit logs found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900">
                          {format(new Date(log.created_at), 'MMM d, yyyy')}
                        </span>
                        <span className="text-xs text-slate-500">
                          {format(new Date(log.created_at), 'HH:mm:ss')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                          <User size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{log.users?.full_name || 'System'}</p>
                          <p className="text-[10px] text-slate-500 font-mono italic">@{log.users?.username || 'auto'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        log.action === 'create' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        log.action === 'update' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        log.action === 'delete' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                        'bg-slate-50 text-slate-700 border-slate-100'
                      }`}>
                        <Activity size={10} />
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-slate-100 text-slate-500 rounded-lg">
                          <Database size={12} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-700 capitalize">{log.entity_type}</span>
                          <span className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">{log.entity_id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button className="flex items-center gap-1.5 text-[11px] font-bold text-primary hover:text-primary-dark transition-colors opacity-0 group-hover:opacity-100">
                        View Details
                        <ArrowUpRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
