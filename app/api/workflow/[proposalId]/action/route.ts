import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { determineRoutingPath } from '@/lib/workflowRouter';

export async function POST(
  req: Request,
  { params }: { params: { proposalId: string } }
) {
  try {
    const proposalId = params.proposalId;
    const body = await req.json();
    const { action_type, action_by, remarks } = body;
    
    // 1. Fetch proposal and current workflow instance
    const { data: proposal, error: pError } = await supabase
      .from('proposals')
      .select('*')
      .eq('id', proposalId)
      .single();
    
    if (pError || !proposal) return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    
    const { data: workflow, error: wError } = await supabase
      .from('workflow_instances')
      .select('*')
      .eq('proposal_id', proposalId)
      .single();
    
    if (wError || !workflow) return NextResponse.json({ error: 'Workflow not initiated' }, { status: 400 });

    const { data: chainStages, error: sError } = await supabase
      .from('approval_stages')
      .select('*')
      .eq('chain_id', workflow.chain_id)
      .order('stage_order', { ascending: true });

    if (sError) throw sError;

    const routingPath = determineRoutingPath(proposal, chainStages);
    const currentPathIndex = routingPath.findIndex(s => s.id === workflow.current_stage_id);
    
    let nextStageId = null;
    let nextStageOrder = null;
    let status = 'active';

    if (action_type === 'approve') {
      if (currentPathIndex < routingPath.length - 1) {
        const nextStage = routingPath[currentPathIndex + 1];
        nextStageId = nextStage.id;
        nextStageOrder = nextStage.stage_order;
      } else {
        status = 'completed';
        await supabase.from('proposals').update({ status: 'approved' }).eq('id', proposalId);
      }
    } else if (action_type === 'return') {
      if (currentPathIndex > 0) {
        const prevStage = routingPath[currentPathIndex - 1];
        nextStageId = prevStage.id;
        nextStageOrder = prevStage.stage_order;
      } else {
        status = 'returned';
        await supabase.from('proposals').update({ status: 'returned' }).eq('id', proposalId);
      }
    }

    // Update workflow instance
    const { error: updError } = await supabase
      .from('workflow_instances')
      .update({
        current_stage_id: nextStageId,
        current_stage_order: nextStageOrder,
        status,
        completed_at: status === 'completed' ? new Date().toISOString() : null
      })
      .eq('id', workflow.id);

    if (updError) throw updError;

    // Log action
    await supabase.from('workflow_actions').insert([{
      workflow_id: workflow.id,
      stage_id: workflow.current_stage_id,
      action_type,
      action_by,
      from_stage_order: workflow.current_stage_order,
      to_stage_order: nextStageOrder,
      remarks
    }]);

    // Update pending approvals
    await supabase.from('pending_approvals').delete().eq('workflow_id', workflow.id);
    
    if (status === 'active' && nextStageId) {
      const stage = routingPath.find(s => s.id === nextStageId);
      await supabase.from('pending_approvals').insert([{
        workflow_id: workflow.id,
        stage_id: nextStageId,
        required_role_id: stage.required_role_id,
        dept_id: stage.dept_id,
        proposal_id: proposalId
      }]);
    }

    return NextResponse.json({ message: 'Action processed successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
