import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET() {
  const { data, error } = await supabase
    .from('appraisal_cases')
    .select('id, case_number, proposed_limit, status, created_at, borrowers(name, type)')
    .order('created_at', { ascending: false });

  return NextResponse.json({ data, error });
}
