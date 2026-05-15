import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/db';
import Link from 'next/link';
import { AppraisalTable } from './appraisal-table';

export const metadata = { title: 'Appraisal Directory' };

export default async function AllAppraisalsPage() {
  const session = await getSession();
  if (!session) return null;

  // Fetch all appraisal cases from the database with borrower info
  // Fetch appraisal cases
  const { data: appraisals, error } = await supabase
    .from('appraisal_cases')
    .select('id, case_number, borrower_id, proposed_limit, status, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch appraisals:', error);
    return <div><div className="bg-red-100 text-red-900 p-4 rounded-lg my-4">Error fetching appraisals: {error.message}</div></div>;
  }

  // Fetch related borrowers manually to bypass foreign key issues
  let borrowersData: Record<string, any> = {};
  if (appraisals && appraisals.length > 0) {
    const borrowerIds = [...new Set(appraisals.map(a => a.borrower_id).filter(Boolean))];
    if (borrowerIds.length > 0) {
      const { data: bData } = await supabase
        .from('borrowers')
        .select('id, name, type')
        .in('id', borrowerIds);
        
      if (bData) {
        bData.forEach(b => {
          borrowersData[b.id] = b;
        });
      }
    }
  }

  const cases = (appraisals || []).map(p => {
    const b = borrowersData[p.borrower_id] || {};
    return {
      id: p.id,
      proposal_number: p.case_number,
      borrower_name: b.name || 'Unknown',
      borrower_type: b.type || 'individual',
      amount: Number(p.proposed_limit) || 0,
      ltv: 62.5, // Mocked until collateral valuation is wired
      status: p.status,
      created_at: p.created_at,
    };
  });



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
