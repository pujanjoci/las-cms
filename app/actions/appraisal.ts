'use server';

import { supabase } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { dispatchNotification } from './notifications';

export async function submitAppraisalAction(data: any) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Generate a unique case number
    const caseNumber = `APP-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    const { data: newCase, error: insertError } = await supabase
      .from('appraisal_cases')
      .insert({
        case_number: caseNumber,
        borrower_id: data.borrowerId,
        proposed_limit: Number(data.facility.amount) || 0,
        tenure_months: Number(data.facility.tenure) || 12,
        interest_rate_pct: Number(data.facility.interestRate) || 0,
        processing_fee_pct: Number(data.facility.processingFee) || 0,
        facility_type: data.facility.type,
        loan_purpose: data.facility.purpose,
        repayment_source: data.facility.repaymentSource,
        status: 'draft',
        current_stage: 'initiator',
        created_by: String(session.id)
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Failed to insert appraisal case:', insertError);
      return { success: false, error: 'Database error while creating the appraisal case.' };
    }

    // Log the initial creation in history
    await supabase.from('appraisal_workflow_history').insert({
      appraisal_id: newCase.id,
      from_stage: 'none',
      to_stage: 'initiator',
      action_type: 'initiate',
      actor_id: String(session.id),
      actor_role: session.roles[0] || 'staff',
      remarks: 'Case initiated.'
    });

    // Dispatch notification
    await dispatchNotification({
      title: `New Appraisal: ${caseNumber}`,
      message: `A new appraisal case has been initiated for NPR ${Number(data.facility.amount).toLocaleString()}.`,
      type: 'appraisal',
      linkUrl: `/appraisal/${newCase.id}`,
      targetRoleCodes: ['supporter']
    });

    revalidatePath('/dashboard');
    return { success: true, caseId: newCase.id };
  } catch (err: any) {
    console.error('submitAppraisalAction error:', err);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function deleteAppraisalAction(id: string) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  // Only admins or the creator should delete this, but for now we allow if authenticated
  try {
    const { error } = await supabase
      .from('appraisal_cases')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete appraisal:', error);
      return { success: false, error: 'Database error while deleting.' };
    }

    revalidatePath('/appraisal/all');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err: any) {
    console.error('deleteAppraisalAction error:', err);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function advanceAppraisalWorkflow(id: string, currentStatus: string, remarks: string = '') {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  // Fetch current stage to ensure we have the correct from_stage
  const { data: appraisal } = await supabase
    .from('appraisal_cases')
    .select('current_stage, status')
    .eq('id', id)
    .single();

  if (!appraisal) return { success: false, error: 'Appraisal not found' };

  const fromStage = appraisal.current_stage;
  const fromStatus = appraisal.status;

  let nextStatus = '';
  let nextStage = '';

  switch (currentStatus) {
    case 'draft':
      nextStatus = 'pending_supporter';
      nextStage = 'supporter';
      break;
    case 'pending_supporter':
      nextStatus = 'pending_reviewer';
      nextStage = 'reviewer';
      break;
    case 'pending_reviewer':
      nextStatus = 'pending_approver';
      nextStage = 'approver';
      break;
    case 'pending_approver':
      nextStatus = 'approved';
      nextStage = 'completed';
      break;
    default:
      return { success: false, error: 'Invalid workflow state for advancement.' };
  }

  try {
    const { error } = await supabase
      .from('appraisal_cases')
      .update({
        status: nextStatus,
        current_stage: nextStage,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Failed to advance appraisal:', error);
      return { success: false, error: 'Database error while advancing workflow.' };
    }

    // Log the transition in history
    await supabase.from('appraisal_workflow_history').insert({
      appraisal_id: id,
      from_stage: fromStage,
      to_stage: nextStage,
      action_type: nextStatus === 'approved' ? 'approve' : 'advance',
      actor_id: String(session.id),
      actor_role: session.roles[0] || 'staff',
      remarks: remarks || `Advanced from ${fromStage} to ${nextStage}.`
    });

    revalidatePath(`/appraisal/${id}`);
    revalidatePath('/appraisal/all');
    revalidatePath('/appraisal/queue');
    revalidatePath('/dashboard');
    
    // Dispatch notification
    let notificationTitle = `Case ${id.slice(0, 8)} Advanced`;
    let notificationMessage = `Appraisal case has been advanced to ${nextStage} stage.`;
    let targetRole = nextStage; // e.g. 'supporter', 'reviewer', 'approver'

    if (nextStatus === 'approved') {
      notificationTitle = `Case ${id.slice(0, 8)} Approved`;
      notificationMessage = `Appraisal case has been final approved!`;
      targetRole = 'initiator'; // notify creator
    }

    await dispatchNotification({
      title: notificationTitle,
      message: notificationMessage,
      type: 'appraisal',
      linkUrl: `/appraisal/${id}`,
      targetRoleCodes: [targetRole]
    });

    return { success: true };
  } catch (err: any) {
    console.error('advanceAppraisalWorkflow error:', err);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function updateAppraisalAction(id: string, data: any) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const { error: updateError } = await supabase
      .from('appraisal_cases')
      .update({
        proposed_limit: Number(data.facility.amount) || 0,
        tenure_months: Number(data.facility.tenure) || 12,
        interest_rate_pct: Number(data.facility.interestRate) || 0,
        processing_fee_pct: Number(data.facility.processingFee) || 0,
        facility_type: data.facility.type,
        loan_purpose: data.facility.purpose,
        repayment_source: data.facility.repaymentSource,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      console.error('Failed to update appraisal case:', updateError);
      return { success: false, error: 'Database error while updating the appraisal case.' };
    }

    revalidatePath(`/appraisal/${id}`);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err: any) {
    console.error('updateAppraisalAction error:', err);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

