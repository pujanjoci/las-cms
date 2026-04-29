import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/db';
import { MemoReviewClient } from './memo-review-client';
import { hasPermission, PERMISSIONS } from '@/lib/rbac';

export const metadata = { title: 'Memo Review — CreditAppraise' };

export default async function MemoReviewPage() {
  const session = await getSession();
  if (!session) return null;

  const isApprover = hasPermission(session, PERMISSIONS.WORKFLOW_APPROVE);

  // If approver, fetch all memos pending review
  let query = supabase
    .from('credit_memos')
    .select('*')
    .order('created_at', { ascending: false });

  // All users can see non-draft memos. Creators can also see their own drafts, but let's just filter out drafts for the review queue.
  query = query.neq('status', 'draft');

  const { data: memoData } = await query;

  const memos = (memoData || []).map(m => ({
    id: m.id,
    ref: m.reference_no,
    applicant: m.applicant_name,
    cif: m.applicant_cif,
    branch: m.branch,
    amount: Number(m.proposed_amount) || 0,
    exposure: Number(m.existing_exposure) || 0,
    purpose: m.purpose,
    narrative: m.narrative,
    grade: m.risk_grade,
    coverage: m.collateral_coverage_pct,
    status: m.status,
    date: m.created_at,
    created_by: m.created_by
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-800">Memo Review Queue</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          Review and approve credit memos · <span className="text-primary font-bold">{memos.length} items</span>
        </p>
      </div>

      <MemoReviewClient memos={memos} isApprover={isApprover} currentUserId={session.id} />
    </div>
  );
}
