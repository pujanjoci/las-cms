import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/db';
import { AnalyticsClient } from './analytics-client';

export const metadata = { title: 'Analytics — CreditAppraise' };

export default async function ReportsPage() {
  const session = await getSession();

  // Fetch all proposals for analytics
  const { data: rawData } = await supabase
    .from('proposals')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <AnalyticsClient rawData={rawData || []} />
  );
}
