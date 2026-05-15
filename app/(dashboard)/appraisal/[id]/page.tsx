import { notFound } from 'next/navigation';
import { supabase } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { StatusBadge } from '@/components/ui/status-badge';
import Link from 'next/link';
import { ArrowLeft, Edit, CheckCircle, Clock } from 'lucide-react';
import { AppraisalWorkflowActions } from './workflow-actions';
import { WorkflowHistory } from '@/components/appraisal/workflow-history';

export default async function AppraisalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return null;

  const resolvedParams = await params;
  const id = resolvedParams.id;

  const { data: appraisal, error } = await supabase
    .from('appraisal_cases')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !appraisal) {
    console.error('Failed to fetch appraisal:', error);
    notFound();
  }

  // Fetch borrower details
  const { data: borrower } = await supabase
    .from('borrowers')
    .select('*')
    .eq('id', appraisal.borrower_id)
    .single();

  // Fetch workflow history
  const { data: history } = await supabase
    .from('appraisal_workflow_history')
    .select(`
      *,
      users (
        full_name
      )
    `)
    .eq('appraisal_id', id)
    .order('created_at', { ascending: true });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/appraisal/all" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="h-5 w-5 text-slate-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Case {appraisal.case_number}</h1>
            <p className="text-sm text-slate-500 mt-1">Created on {new Date(appraisal.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <StatusBadge status={appraisal.status} />
          <AppraisalWorkflowActions appraisalId={id} status={appraisal.status} />
          <Link href={`/appraisal/${id}/edit`} className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors">
            <Edit className="h-4 w-4" />
            <span>Edit Case</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
              <h2 className="font-semibold text-slate-800">Facility Details</h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Proposed Limit</p>
                <p className="text-base font-semibold text-slate-900">NPR {Number(appraisal.proposed_limit).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Facility Type</p>
                <p className="text-base font-medium text-slate-900 capitalize">{appraisal.facility_type.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Interest Rate</p>
                <p className="text-base font-medium text-slate-900">{appraisal.interest_rate_pct}%</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Processing Fee</p>
                <p className="text-base font-medium text-slate-900">{appraisal.processing_fee_pct}%</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Loan Purpose</p>
                <p className="text-sm text-slate-700">{appraisal.loan_purpose}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Repayment Source</p>
                <p className="text-sm text-slate-700">{appraisal.repayment_source}</p>
              </div>
            </div>
          </div>

          <WorkflowHistory history={history || []} />
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
              <h2 className="font-semibold text-slate-800">Borrower Info</h2>
            </div>
            <div className="p-6 space-y-4">
              {borrower ? (
                <>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Name</p>
                    <p className="text-sm font-medium text-slate-900">{borrower.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Type</p>
                    <p className="text-sm text-slate-700 capitalize">{borrower.type}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Contact</p>
                    <p className="text-sm text-slate-700">{borrower.phone}</p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-100">
                    <Link href={`/borrowers/${borrower.id}`} className="text-sm text-indigo-600 font-medium hover:text-indigo-700">
                      View Full Profile &rarr;
                    </Link>
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-500 italic">Borrower information unavailable.</p>
              )}
            </div>
          </div>
          
          <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-6">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-emerald-900">Current Stage</h3>
                <p className="text-sm text-emerald-700 mt-1 capitalize">{appraisal.current_stage.replace(/_/g, ' ')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
