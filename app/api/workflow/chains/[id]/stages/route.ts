import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const chainId = params.id;
    const body = await req.json();
    const { 
      stage_order, 
      stage_name, 
      dept_id, 
      required_role_id, 
      amount_min, 
      amount_max, 
      allow_parallel, 
      quorum_required, 
      auto_escalate_days, 
      is_mandatory 
    } = body;
    
    const { data: stage, error } = await supabase
      .from('approval_stages')
      .insert([{
        chain_id: chainId,
        stage_order,
        stage_name,
        dept_id,
        required_role_id,
        amount_min: amount_min || 0,
        amount_max: amount_max || null,
        allow_parallel: !!allow_parallel,
        quorum_required: quorum_required || 1,
        auto_escalate_days: auto_escalate_days || 7,
        is_mandatory: is_mandatory !== false
      }])
      .select()
      .single();
    
    if (error) throw error;
    return NextResponse.json(stage);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
