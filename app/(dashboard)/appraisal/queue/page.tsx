import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/db';
import { Clock, ArrowRight, AlertCircle, CheckCircle, MapPin, Building2 } from 'lucide-react';
import Link from 'next/link';

export const metadata = { title: 'My Queue — CreditAppraise' };

export default async function QueuePage() {
  const session = await getSession();
  if (!session) return null;

  // 1. Fetch user's assigned roles/departments and ALL relevant data in parallel
  const [userRolesRes, pendingRes, draftsRes] = await Promise.all([
    supabase
      .from('user_roles')
      .select('role_id, dept_id')
      .eq('user_id', session.id),
    supabase
      .from('pending_approvals')
      .select(`
        *,
        proposals (id, proposal_number, amount, facility_type, created_at, borrowers(name)),
        approval_stages (stage_name),
        departments (dept_name)
      `)
      .order('created_at', { ascending: true }),
    supabase
      .from('proposals')
      .select('id, proposal_number, amount, created_at, borrowers(name)')
      .eq('created_by', session.id)
      .eq('status', 'draft')
  ]);

  const userRoles = userRolesRes.data || [];
  const pending = pendingRes.data || [];
  const drafts = draftsRes.data || [];

  // 2. Filter items that match the user's role-department pairs
  const myQueue = pending.filter(item => 
    userRoles.some(ur => ur.role_id === item.required_role_id && ur.dept_id === item.dept_id)
  ).map(item => ({
    id: item.proposals?.id,
    caseNo: item.proposals?.proposal_number,
    borrower: (item.proposals?.borrowers as any)?.name || 'Unknown',
    amount: Number(item.proposals?.amount) || 0,
    stage: item.approval_stages?.stage_name,
    department: item.departments?.dept_name,
    facility: item.proposals?.facility_type,
    created: item.proposals?.created_at,
    priority: Number(item.proposals?.amount) > 10000000 ? 'high' : 'normal',
  }));

  const myDrafts = drafts.map(p => ({
    id: p.id,
    caseNo: p.proposal_number,
    borrower: (p.borrowers as any)?.name || 'Unknown',
    amount: Number(p.amount) || 0,
    stage: 'Draft',
    department: 'Self',
    facility: 'N/A',
    created: p.created_at,
    priority: 'normal',
    isDraft: true
  }));

  const allItems = [...myQueue, ...myDrafts];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-800 tracking-tight">My Queue</h1>
        <p className="text-slate-500 mt-1 font-medium italic">
          Manage cases awaiting your action · <span className="text-primary font-bold">{allItems.length} total</span>
        </p>
      </div>

      {allItems.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-24 flex flex-col items-center text-center space-y-6">
          <div className="h-24 w-24 rounded-[2rem] bg-emerald-50 flex items-center justify-center shadow-inner">
            <CheckCircle className="h-12 w-12 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-display font-bold text-slate-800">Clear Skies!</h3>
            <p className="text-slate-500 max-w-xs mx-auto font-medium">You have no pending approvals or draft proposals at this time.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-5">
          {allItems.map((item) => (
            <div key={item.id} className="group bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl hover:border-primary/20 transition-all duration-300">
              <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-6">
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm ${
                    item.priority === 'high' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                  }`}>
                    {item.priority === 'high' ? <AlertCircle className="h-7 w-7" /> : <Clock className="h-7 w-7" />}
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-[10px] font-bold text-indigo-600 font-mono tracking-widest bg-indigo-50/50 px-2 py-0.5 rounded border border-indigo-100/50 uppercase">{item.caseNo}</span>
                      {item.isDraft && (
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[9px] font-bold uppercase tracking-widest border border-slate-200 shadow-xs">Draft Case</span>
                      )}
                      {item.priority === 'high' && (
                        <span className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-600 text-[9px] font-bold uppercase tracking-widest border border-rose-100 shadow-xs">High Priority</span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 group-hover:text-primary transition-colors">{item.borrower}</h3>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-sm">
                      <div className="flex items-center gap-1.5 font-bold text-slate-400 uppercase tracking-tighter">
                        <Building2 className="h-3.5 w-3.5" />
                        {item.department}
                      </div>
                      <div className="flex items-center gap-1.5 font-bold text-slate-700">
                        NPR {item.amount.toLocaleString()}
                      </div>
                      <div className="px-2.5 py-0.5 rounded-lg bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/10">
                        {item.stage}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8 self-end md:self-center">
                  <div className="text-right hidden lg:block border-r border-slate-100 pr-8">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Assigned On</p>
                    <p className="text-sm font-bold text-slate-700 tracking-tight">{new Date(item.created).toLocaleDateString('en-NP')}</p>
                  </div>
                  
                  <Link
                    href={`/appraisal/${item.id}`}
                    className="flex items-center gap-2.5 px-7 py-3.5 bg-primary text-white rounded-2xl text-sm font-bold hover:bg-primary-dark transition-all shadow-md shadow-indigo-100 active:scale-95 group-hover:-translate-y-0.5 ring-1 ring-primary/20"
                  >
                    {item.isDraft ? 'Complete Case' : 'Process Review'}
                    <ArrowRight className="h-4 w-4" />
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
