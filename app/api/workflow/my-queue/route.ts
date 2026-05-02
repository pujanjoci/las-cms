import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch user's roles and departments from the junction table
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('role_id, dept_id')
      .eq('user_id', session.id);

    if (roleError || !userRoles || userRoles.length === 0) return NextResponse.json([]);

    // We can't easily do an OR query with multiple pairs in Supabase's simple syntax for cross-column matches
    // but we can fetch all pending and filter in JS, or use a complex query
    const { data: queue, error: queueError } = await supabase
      .from('pending_approvals')
      .select(`
        *,
        proposals (proposal_number, facility_type, amount),
        borrowers:proposals (borrower_id, borrowers (name)),
        approval_stages (stage_name),
        departments (dept_name)
      `)
      .order('created_at', { ascending: true });

    if (queueError) throw queueError;

    // Filter queue items that match any of the user's role-dept assignments
    const myQueue = queue?.filter(item => 
      userRoles.some(ur => ur.role_id === item.required_role_id && ur.dept_id === item.dept_id)
    ).map(item => ({
      ...item,
      proposal_number: item.proposals?.proposal_number,
      facility_type: item.proposals?.facility_type,
      amount: item.proposals?.amount,
      borrower_name: item.proposals?.borrowers?.name,
      stage_name: item.approval_stages?.stage_name,
      dept_name: item.departments?.dept_name
    }));

    return NextResponse.json(myQueue || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
