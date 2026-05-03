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
          <h1 className="text-3xl font-display font-bold tracking-tight text-slate-800">Approval Queue</h1>
          <p className="text-slate-500 mt-1 font-medium">Review and action proposals pending your approval.</p>
        </div>
        <div className="flex items-center gap-3 px-5 py-2.5 bg-indigo-50 border border-indigo-100 rounded-2xl shadow-sm shadow-indigo-100/50">
          <TrendingUp size={18} className="text-primary" />
          <span className="text-sm font-bold text-primary">{queue.length} Pending Actions</span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-white border border-slate-100 rounded-2xl animate-pulse shadow-sm" />
          ))}
        </div>
      ) : queue.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {queue.map(item => {
            const wait = getWaitTime(item.created_at);
            return (
              <div key={item.id} className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-premium hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-primary" />
                        <span className="text-[10px] font-mono text-indigo-600 font-bold tracking-widest">{item.proposal_no}</span>
                      </div>
                      <h3 className="font-bold text-lg text-slate-800 group-hover:text-primary transition-colors line-clamp-1">{item.borrower_name}</h3>
                    </div>
                    <div className={`flex flex-col items-end gap-1 ${wait.color}`}>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-50 border border-slate-100">
                        <Clock size={12} />
                        <span className="text-[9px] font-bold uppercase tracking-wider">{wait.text}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded text-[10px] font-bold uppercase tracking-tight text-slate-500">
                      {item.facility_type.replace('_', ' ')}
                    </span>
                    <div className="h-1 w-1 rounded-full bg-slate-300" />
                    <span className="text-sm font-bold text-slate-700">{formatCurrency(item.sanctioned_limit)}</span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2.5">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      <Landmark size={12} />
                      <span>Current Stage</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-800">{item.stage_name}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-white border border-slate-100 text-primary rounded-lg font-bold uppercase shadow-sm">{item.dept_name}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-6">
                  <button className="flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-[11px] hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100 active:scale-95 uppercase tracking-wide">
                    <CheckCircle2 size={14} />
                    <span>Approve</span>
                  </button>
                  <button className="flex items-center justify-center gap-2 py-2.5 bg-rose-600 text-white rounded-xl font-bold text-[11px] hover:bg-rose-700 transition-all shadow-md shadow-rose-100 active:scale-95 uppercase tracking-wide">
                    <XCircle size={14} />
                    <span>Return</span>
                  </button>
                  <button className="flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-[11px] hover:bg-slate-50 transition-all shadow-sm active:scale-95 uppercase tracking-wide">
                    <ArrowUpCircle size={14} className="text-blue-600" />
                    <span>Escalate</span>
                  </button>
                  <button className="flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-[11px] hover:bg-slate-50 transition-all shadow-sm active:scale-95 uppercase tracking-wide">
                    <HelpCircle size={14} className="text-amber-600" />
                    <span>Query</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-white border border-slate-200 rounded-[32px] text-center space-y-6 shadow-sm">
          <div className="p-8 bg-emerald-50 rounded-full text-emerald-500 shadow-inner">
            <CheckCircle2 size={48} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-display font-bold text-slate-800">Your Queue is Clear</h3>
            <p className="text-slate-500 max-w-sm mx-auto font-medium">Excellent work! You've actioned all proposals currently assigned to your authority level.</p>
          </div>
        </div>
      )}
    </div>
  );
}
