import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/db';
import { Clock, ArrowRight, AlertCircle, CheckCircle, MapPin, Building2 } from 'lucide-react';
import Link from 'next/link';

export const metadata = { title: 'My Queue — CreditAppraise' };

export default async function QueuePage() {
  const session = await getSession();
  if (!session) return null;

  // 1. Fetch user's assigned roles and departments
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('role_id, dept_id')
    .eq('user_id', session.id);

  // 2. Fetch ALL pending approvals with related data
  const { data: pending } = await supabase
    .from('pending_approvals')
    .select(`
      *,
      proposals (id, proposal_number, amount, facility_type, created_at, borrowers(name)),
      approval_stages (stage_name),
      departments (dept_name)
    `)
    .order('created_at', { ascending: true });

  // 3. Filter items that match the user's role-department pairs
  const roleDeptPairs = userRoles || [];
  
  const myQueue = (pending || []).filter(item => 
    roleDeptPairs.some(ur => ur.role_id === item.required_role_id && ur.dept_id === item.dept_id)
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

  // 4. Fetch own drafts for initiators
  const { data: drafts } = await supabase
    .from('proposals')
    .select('id, proposal_number, amount, created_at, borrowers(name)')
    .eq('created_by', session.id)
    .eq('status', 'draft');

  const myDrafts = (drafts || []).map(p => ({
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
        <h1 className="text-3xl font-display font-bold text-slate-900">My Queue</h1>
        <p className="text-slate-500 mt-2 font-medium">
          Manage cases awaiting your action · <span className="text-primary font-bold">{allItems.length} total</span>
        </p>
      </div>

      {allItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-20 flex flex-col items-center text-center">
          <div className="h-20 w-20 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6">
            <CheckCircle className="h-10 w-10 text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Clear Skies!</h3>
          <p className="text-slate-400 mt-2 max-w-xs">You have no pending approvals or draft proposals at this time.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {allItems.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:border-primary/30 transition-all group">
              <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-5">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                    item.priority === 'high' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-500'
                  }`}>
                    {item.priority === 'high' ? <AlertCircle className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-indigo-600 font-mono tracking-wider">{item.caseNo}</span>
                      {item.isDraft && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-tight">Draft</span>
                      )}
                      {item.priority === 'high' && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 text-[10px] font-bold uppercase tracking-tight border border-rose-100">High Value</span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{item.borrower}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Building2 className="h-3.5 w-3.5 text-slate-400" />
                        {item.department}
                      </div>
                      <div className="flex items-center gap-1.5 font-bold text-slate-700">
                        NPR {item.amount.toLocaleString()}
                      </div>
                      <div className="px-2 py-0.5 rounded bg-primary/5 text-primary text-[11px] font-bold uppercase tracking-wide">
                        {item.stage}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 self-end md:self-center">
                  <div className="text-right hidden lg:block">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Created</p>
                    <p className="text-sm font-bold text-slate-700">{new Date(item.created).toLocaleDateString('en-NP')}</p>
                  </div>
                  
                  <Link
                    href={`/appraisal/${item.id}`}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition-all shadow-sm hover:shadow-indigo-200 group-hover:-translate-y-0.5"
                  >
                    {item.isDraft ? 'Complete Draft' : 'Process Review'}
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
