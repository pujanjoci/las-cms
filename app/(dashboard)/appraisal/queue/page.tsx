import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/db';
import { StatusBadge } from '@/components/ui/status-badge';
import { Clock, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata = { title: 'My Queue — CreditAppraise' };

export default async function QueuePage() {
  const session = await getSession();
  if (!session) return null;

  const role = session.roles?.[0] || 'initiator';

  // Determine which workflow stages map to the user's role
  const pendingStatusMap: Record<string, string> = {
    supporter: 'pending_supporter',
    super_staff: 'pending_supporter',
    reviewer: 'pending_reviewer',
    approver: 'pending_approver',
  };

  const myPendingStatus = pendingStatusMap[role];

  // If the user's role has a mapped stage, fetch cases in that stage
  // Otherwise (for initiators/admins), show cases they created that are still in draft
  let queueItems: any[] = [];

  if (myPendingStatus) {
    const { data } = await supabase
      .from('proposals')
      .select('id, proposal_number, amount, status, created_at, borrowers(name)')
      .eq('status', myPendingStatus)
      .order('created_at', { ascending: true });

    queueItems = (data || []).map(p => ({
      id: p.id,
      caseNo: p.proposal_number,
      borrower: (p.borrowers as any)?.name || 'Unknown',
      amount: Number(p.amount) || 0,
      action: myPendingStatus.replace('pending_', '').replace('_', ' '),
      due: p.created_at,
      priority: Number(p.amount) > 10000000 ? 'high' : 'normal',
    }));
  } else {
    // For initiators/admins - show their own drafts
    const { data } = await supabase
      .from('proposals')
      .select('id, proposal_number, amount, status, created_at, borrowers(name)')
      .eq('created_by', session.id)
      .eq('status', 'draft')
      .order('created_at', { ascending: true });

    queueItems = (data || []).map(p => ({
      id: p.id,
      caseNo: p.proposal_number,
      borrower: (p.borrowers as any)?.name || 'Unknown',
      amount: Number(p.amount) || 0,
      action: 'Complete & Submit',
      due: p.created_at,
      priority: 'normal',
    }));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-800">My Queue</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          Cases assigned to you for action · <span className="text-primary font-bold">{queueItems.length} pending</span>
        </p>
      </div>

      {queueItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 flex flex-col items-center text-center">
          <div className="h-16 w-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-emerald-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">All caught up!</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-xs">No pending tasks in your queue right now.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {queueItems.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                    item.priority === 'high' ? 'bg-red-50 text-red-500' : item.priority === 'normal' ? 'bg-amber-50 text-amber-500' : 'bg-slate-50 text-slate-400'
                  }`}>
                    {item.priority === 'high' ? <AlertCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-xs text-indigo-600 font-bold">{item.caseNo}</span>
                      {item.priority === 'high' && (
                        <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-wider border border-red-100">Urgent</span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-slate-800 mt-1">{item.borrower}</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      NPR {item.amount.toLocaleString()} · Action: <span className="text-primary font-bold capitalize">{item.action}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Created</p>
                    <p className="text-xs font-bold text-slate-700">{new Date(item.due).toLocaleDateString('en-NP')}</p>
                  </div>
                  <Link
                    href={`/appraisal/${item.id}`}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-dark transition-all shadow-sm group-hover:shadow-md"
                  >
                    Open Case
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
