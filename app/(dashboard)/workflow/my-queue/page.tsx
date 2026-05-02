'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircle2, XCircle, ArrowUpCircle, HelpCircle, 
  Clock, Landmark, FileText, ChevronRight,
  TrendingUp, AlertTriangle
} from 'lucide-react';

interface QueueItem {
  id: string;
  proposal_id: string;
  proposal_no: string;
  borrower_name: string;
  facility_type: string;
  sanctioned_limit: number;
  stage_name: string;
  dept_name: string;
  created_at: string;
}

export default function MyQueuePage() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      const res = await fetch('/api/workflow/my-queue');
      const data = await res.json();
      setQueue(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch queue:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getWaitTime = (createdAt: string) => {
    const start = new Date(createdAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return { text: 'Today', color: 'text-emerald-500' };
    if (diffDays < 3) return { text: `${diffDays} days ago`, color: 'text-emerald-500' };
    if (diffDays < 7) return { text: `${diffDays} days ago`, color: 'text-amber-500' };
    return { text: `${diffDays} days ago`, color: 'text-rose-500' };
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Approval Queue</h1>
          <p className="text-muted-foreground mt-1">Review and action proposals pending your approval.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-primary/5 border border-primary/20 rounded-lg">
          <TrendingUp size={18} className="text-primary" />
          <span className="text-sm font-bold text-primary">{queue.length} Pending Actions</span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-card border border-border/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : queue.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {queue.map(item => {
            const wait = getWaitTime(item.created_at);
            return (
              <div key={item.id} className="group bg-card border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-primary" />
                        <span className="text-xs font-mono text-muted-foreground font-bold tracking-wider">{item.proposal_no}</span>
                      </div>
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-1">{item.borrower_name}</h3>
                    </div>
                    <div className={`flex flex-col items-end gap-1 ${wait.color}`}>
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span className="text-[10px] font-bold uppercase">{wait.text}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-surface border border-border/50 rounded text-[10px] font-bold uppercase text-muted-foreground">
                      {item.facility_type.replace('_', ' ')}
                    </span>
                    <div className="h-1 w-1 rounded-full bg-border" />
                    <span className="text-sm font-bold">{formatCurrency(item.sanctioned_limit)}</span>
                  </div>

                  <div className="p-3 bg-surface rounded-xl border border-border/50 space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      <Landmark size={12} />
                      <span>Current Stage</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{item.stage_name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded font-bold uppercase">{item.dept_name}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-6">
                  <button className="flex items-center justify-center gap-2 py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-xs hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/10 active:scale-95">
                    <CheckCircle2 size={14} />
                    <span>Approve</span>
                  </button>
                  <button className="flex items-center justify-center gap-2 py-2.5 bg-rose-500 text-white rounded-xl font-bold text-xs hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/10 active:scale-95">
                    <XCircle size={14} />
                    <span>Return</span>
                  </button>
                  <button className="flex items-center justify-center gap-2 py-2.5 bg-blue-500 text-white rounded-xl font-bold text-xs hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/10 active:scale-95">
                    <ArrowUpCircle size={14} />
                    <span>Escalate</span>
                  </button>
                  <button className="flex items-center justify-center gap-2 py-2.5 bg-amber-500 text-white rounded-xl font-bold text-xs hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/10 active:scale-95">
                    <HelpCircle size={14} />
                    <span>Query</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-card/50 border border-dashed border-border/50 rounded-3xl text-center space-y-4">
          <div className="p-6 bg-emerald-500/10 rounded-full text-emerald-500">
            <CheckCircle2 size={48} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground">Your Queue is Clear</h3>
            <p className="text-muted-foreground mt-2 max-w-sm mx-auto">Excellent work! You've actioned all proposals currently assigned to your authority level.</p>
          </div>
        </div>
      )}
    </div>
  );
}
