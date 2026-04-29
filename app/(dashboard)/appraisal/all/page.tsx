import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/db';
import Link from 'next/link';
import { AppraisalTable } from './appraisal-table';

export const metadata = { title: 'Appraisal Directory' };

export default async function AllAppraisalsPage() {
  const session = await getSession();
  if (!session) return null;

  // Fetch all proposals from the database with borrower info
  const { data: proposals, error } = await supabase
    .from('proposals')
    .select('id, proposal_number, amount, status, created_at, borrowers(name, type)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching proposals:', error);
  }

  const cases = (proposals || []).map(p => ({
    id: p.id,
    proposal_number: p.proposal_number,
    borrower_name: (p.borrowers as any)?.name || 'Unknown',
    borrower_type: (p.borrowers as any)?.type || 'individual',
    amount: Number(p.amount) || 0,
    ltv: 62.5, // Mocked until collateral valuation is wired
    status: p.status,
    created_at: p.created_at,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-800">Appraisal Directory</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Manage and track all credit appraisal cases · <span className="text-primary font-bold">{cases.length} total</span>
          </p>
        </div>
        <Link href="/appraisal/new" className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-100 flex items-center gap-2">
          + New Appraisal
        </Link>
      </div>

      <AppraisalTable cases={cases} />
    </div>
  );
}
