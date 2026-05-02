'use server';

import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { hasPermission, PERMISSIONS } from '@/lib/rbac';
import { auditLog } from '@/lib/audit';

export async function createMemoAction(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session) {
    return { error: 'Not authenticated' };
  }

  if (!hasPermission(session, PERMISSIONS.PROPOSAL_CREATE)) {
    return { error: 'You do not have permission to create memos' };
  }

  // Extract form data
  const applicant_name = formData.get('applicant_name') as string;
  const applicant_cif = formData.get('applicant_cif') as string;
  const branch = formData.get('branch') as string;
  const proposed_amount = parseFloat(formData.get('proposed_amount') as string);
  const risk_grade = formData.get('risk_grade') as string;
  const collateral_coverage_pct = parseFloat(formData.get('collateral_coverage_pct') as string);
  const narrative = formData.get('narrative') as string;
  const isDraft = formData.get('action_type') === 'draft';

  // Basic validation
  if (!applicant_name || !applicant_cif || !branch || isNaN(proposed_amount) || !risk_grade || isNaN(collateral_coverage_pct) || !narrative) {
    return { error: 'Please fill out all required fields' };
  }

  // Generate Reference Number
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const reference_no = `CM-2081-${randomNum}`;

  // Insert into DB
  const { error } = await supabase.from('credit_memos').insert({
    reference_no,
    applicant_name,
    applicant_cif,
    branch,
    facility_type: 'Margin Lending', // Default for now
    proposed_amount,
    existing_exposure: 0, // Default
    purpose: 'Investment in shares', // Default
    risk_grade: risk_grade.charAt(0), // Extract just 'A' from 'A — Low Risk'
    collateral_coverage_pct,
    narrative,
    status: isDraft ? 'draft' : 'pending_review',
    created_by: session.id,
  });

  if (error) {
    console.error('Error creating memo:', error);
    return { error: 'Failed to create credit memo' };
  }

  // Log Audit Trail
  const { data: newMemo } = await supabase.from('credit_memos').select('id').eq('reference_no', reference_no).single();
  if (newMemo) {
    await auditLog({
      entityType: 'credit_memo',
      entityId: newMemo.id,
      action: 'create',
      after: { reference_no, applicant_name, proposed_amount, status: isDraft ? 'draft' : 'pending_review' },
      actorId: session.id,
    });
  }

  revalidatePath('/memo/review');
  revalidatePath('/dashboard');
  
  if (isDraft) {
    return { success: 'Memo saved as draft', redirect: '/dashboard' };
  } else {
    return { success: 'Memo submitted for review', redirect: '/memo/review' };
  }
}

export async function updateMemoStatusAction(memoId: string, newStatus: string) {
  const session = await getSession();
  if (!session) {
    return { error: 'Not authenticated' };
  }

  if (!hasPermission(session, PERMISSIONS.WORKFLOW_APPROVE)) {
    return { error: 'You do not have permission to review memos' };
  }

  const { error } = await supabase
    .from('credit_memos')
    .update({ 
      status: newStatus,
      reviewed_by: session.id,
      reviewed_at: new Date().toISOString()
    })
    .eq('id', memoId);

  if (error) {
    return { error: 'Failed to update memo status' };
  }

  // Log Audit Trail
  await auditLog({
    entityType: 'credit_memo',
    entityId: memoId,
    action: 'update_status',
    after: { status: newStatus },
    actorId: session.id,
  });

  revalidatePath('/memo/review');
  return { success: true };
}

export async function deleteMemoAction(memoId: string) {
  const session = await getSession();
  if (!session) {
    return { error: 'Not authenticated' };
  }

  // Verify ownership
  const { data: memo } = await supabase
    .from('credit_memos')
    .select('created_by')
    .eq('id', memoId)
    .single();

  if (!memo) {
    return { error: 'Memo not found' };
  }

  // Super admins or the creator can delete
  const isSuperAdmin = session.roles.includes('super_admin');
  if (memo.created_by !== session.id && !isSuperAdmin) {
    return { error: 'You can only delete your own memos' };
  }

  const { error } = await supabase
    .from('credit_memos')
    .delete()
    .eq('id', memoId);

  if (error) {
    return { error: 'Failed to delete memo' };
  }

  revalidatePath('/memo/review');
  revalidatePath('/dashboard');
  return { success: true };
}
