import { notFound } from 'next/navigation';
import { supabase } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { EditAppraisalForm } from '@/components/appraisal/edit-appraisal-form';

export default async function EditAppraisalPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return null;

  const resolvedParams = await params;
  const id = resolvedParams.id;

  // Fetch appraisal data
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

  // Fetch KYC count
  const { data: kycDocs } = await supabase
    .from('kyc_documents')
    .select('id')
    .eq('borrower_id', appraisal.borrower_id);

  return (
    <EditAppraisalForm 
      appraisal={appraisal} 
      borrower={borrower} 
      kycInitialCount={kycDocs?.length || 0}
    />
  );
}
