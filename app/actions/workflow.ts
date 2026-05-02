'use server';

import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auditLog } from '@/lib/audit';

/**
 * Initializes a workflow for a proposal (appraisal or memo)
 */
export async function submitToWorkflowAction(proposalId: string, facilityType: string, amount: number) {
  const session = await getSession();
  if (!session) return { error: 'Not authenticated' };

  try {
    // 1. Find matching approval chain
    // We search for a chain that supports this facility type
    const { data: chains, error: chainError } = await supabase
      .from('approval_chains')
      .select('*, approval_stages(*)')
      .eq('is_active', true);

    if (chainError) throw chainError;

    const matchingChain = chains.find(c => {
      const types = typeof c.facility_types === 'string' ? JSON.parse(c.facility_types) : c.facility_types;
      return Array.isArray(types) && types.includes(facilityType.toLowerCase().replace(' ', '_'));
    });

    if (!matchingChain) {
      return { error: 'No active approval chain found for this facility type.' };
    }

    // 2. Find the first stage
    const stages = matchingChain.approval_stages.sort((a: any, b: any) => a.stage_order - b.stage_order);
    const firstStage = stages[0];

    if (!firstStage) {
      return { error: 'Approval chain has no stages configured.' };
    }

    // 3. Create workflow entry
    const { error: workflowError } = await supabase
      .from('proposal_workflow')
      .insert({
        proposal_id: proposalId,
        chain_id: matchingChain.id,
        current_stage_id: firstStage.id,
        assigned_to_role_id: firstStage.role_id,
        assigned_to_dept_id: firstStage.dept_id,
        status: 'pending'
      });

    if (workflowError) throw workflowError;

    // 4. Update the proposal status
    // We update credit_memos for now, but this could be generalized
    await supabase
      .from('credit_memos')
      .update({ status: 'in_progress' })
      .eq('id', proposalId);

    // 5. Audit Log
    await auditLog({
      entityType: 'workflow',
      entityId: proposalId,
      action: 'start_workflow',
      after: { chain_id: matchingChain.id, stage: firstStage.stage_name },
      actorId: session.id,
    });

    revalidatePath('/dashboard');
    revalidatePath('/appraisal/queue');
    
    return { success: true };
  } catch (error: any) {
    console.error('Workflow submission error:', error);
    return { error: error.message || 'Failed to submit to workflow' };
  }
}

/**
 * Approve a workflow step
 */
export async function approveWorkflowStepAction(proposalId: string, comments: string) {
  const session = await getSession();
  if (!session) return { error: 'Not authenticated' };

  try {
    // 1. Get current workflow state
    const { data: workflow, error: wfError } = await supabase
      .from('proposal_workflow')
      .select('*, approval_chains(*, approval_stages(*))')
      .eq('proposal_id', proposalId)
      .single();

    if (wfError || !workflow) throw new Error('Workflow not found for this proposal');

    const stages = workflow.approval_chains.approval_stages.sort((a: any, b: any) => a.stage_order - b.stage_order);
    const currentStageIndex = stages.findIndex((s: any) => s.id === workflow.current_stage_id);
    const nextStage = stages[currentStageIndex + 1];

    // 2. Record history
    await supabase.from('workflow_history').insert({
      proposal_id: proposalId,
      stage_id: workflow.current_stage_id,
      actor_id: session.id,
      action: 'approve',
      comments
    });

    if (nextStage) {
      // 3a. Move to next stage
      await supabase
        .from('proposal_workflow')
        .update({
          current_stage_id: nextStage.id,
          assigned_to_role_id: nextStage.role_id,
          assigned_to_dept_id: nextStage.dept_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', workflow.id);
    } else {
      // 3b. Final approval
      await supabase
        .from('proposal_workflow')
        .update({
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', workflow.id);

      await supabase
        .from('credit_memos')
        .update({ status: 'approved' })
        .eq('id', proposalId);
    }

    // 4. Audit Log
    await auditLog({
      entityType: 'workflow',
      entityId: proposalId,
      action: nextStage ? 'approve_step' : 'final_approve',
      after: { stage: nextStage ? nextStage.stage_name : 'Completed' },
      actorId: session.id,
    });

    revalidatePath('/dashboard');
    revalidatePath('/appraisal/queue');

    return { success: true };
  } catch (error: any) {
    console.error('Workflow approval error:', error);
    return { error: error.message || 'Failed to approve' };
  }
}
