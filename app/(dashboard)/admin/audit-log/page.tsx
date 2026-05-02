'use client';

import { useState, useEffect } from 'react';
import { 
  Search, Filter, Download, 
  History, User as UserIcon, Shield,
  ArrowRight, Globe, Monitor
} from 'lucide-react';

interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  action: string;
  entity_type: string;
  entity_id: string;
  entity_label: string;
  field_name: string;
  before_value: string;
  after_value: string;
  ip_address: string;
  user_agent: string;
  logged_at: string;
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [entityFilter]);

  const fetchLogs = async () => {
    try {
      const url = `/api/audit-logs${entityFilter ? `?entity_type=${entityFilter}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      setLogs(data.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'UPDATE': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'DELETE': return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
      case 'APPROVE': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'RETURN': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'OVERRIDE': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'CONFIG_CHANGE': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      default: return 'bg-muted text-muted-foreground border-border/50';
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <History className="text-primary" size={32} />
            System Audit Trail
          </h1>
          <p className="text-muted-foreground mt-1 italic">
            Immutable records of every system action. Tamper-proof and compliance-ready.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-foreground text-background px-6 py-2.5 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-black/10 active:scale-95">
          <Download size={20} />
          <span>Export Logs (CSV)</span>
        </button>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl shadow-2xl shadow-black/5 overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-border/50 bg-card/50 backdrop-blur-sm flex flex-wrap gap-4 items-center">
          <div className="relative w-full md:w-64">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Filter by label or user..." 
              className="w-full bg-surface border border-border/50 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <select 
            className="bg-surface border border-border/50 rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-primary/20"
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
          >
            <option value="">All Entities</option>
            <option value="proposal">Proposals</option>
            <option value="borrower">Borrowers</option>
            <option value="user">Users</option>
            <option value="workflow">Workflow</option>
            <option value="config">Config</option>
          </select>
          <div className="flex-1" />
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-surface px-3 py-1.5 rounded-lg border border-border/50">
            {logs.length} Actions Logged
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface/50 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Actor</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Entity</th>
                <th className="px-6 py-4">Changes</th>
                <th className="px-6 py-4">Network</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-6"><div className="h-4 bg-muted rounded w-full" /></td>
                  </tr>
                ))
              ) : logs.map(log => (
                <tr key={log.id} className="hover:bg-surface/30 transition-colors text-xs">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-mono text-muted-foreground">
                      {new Date(log.logged_at).toLocaleString('en-NP')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-primary/5 rounded border border-primary/10">
                        <UserIcon size={12} className="text-primary" />
                      </div>
                      <div>
                        <div className="font-bold">{log.user_name}</div>
                        <div className="text-[10px] text-muted-foreground font-medium">{log.user_role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md border text-[9px] font-bold uppercase tracking-wider ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-0.5">
                      <div className="font-bold text-foreground capitalize">{log.entity_type}</div>
                      <div className="text-[10px] text-muted-foreground truncate max-w-[200px]">{log.entity_label || log.entity_id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {log.field_name ? (
                      <div className="flex items-center gap-2 bg-surface p-2 rounded-lg border border-border/50 max-w-[300px]">
                        <span className="font-bold text-primary italic shrink-0">{log.field_name}</span>
                        <div className="flex items-center gap-1 overflow-hidden">
                          <span className="text-muted-foreground truncate">{log.before_value || 'null'}</span>
                          <ArrowRight size={10} className="text-primary shrink-0" />
                          <span className="font-bold truncate">{log.after_value || 'null'}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic">No specific field changes</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <div className="flex items-center gap-1.5 tooltip" title={log.ip_address}>
                        <Globe size={14} />
                        <span className="font-mono text-[10px]">{log.ip_address}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Monitor size={14} />
                        <span className="truncate max-w-[100px] text-[10px]">{log.user_agent}</span>
                      </div>
                    </div>
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
