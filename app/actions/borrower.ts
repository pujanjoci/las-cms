'use server';

import { borrowerSchema } from '@/lib/validators';
import { supabase } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { auditLog } from '@/lib/audit';
import { redirect } from 'next/navigation';
import { PERMISSIONS, requirePermission } from '@/lib/rbac';
import { revalidatePath } from 'next/cache';

export async function createBorrower(prevState: any, formData: FormData) {
  const session = await requireAuth();
  requirePermission(session, PERMISSIONS.BORROWER_CREATE);

  const data = Object.fromEntries(formData.entries());
  
  // Format numeric values if present
  if (data.annual_turnover) data.annual_turnover = Number(data.annual_turnover);
  if (data.years_in_business) data.years_in_business = Number(data.years_in_business);
  if (data.number_of_employees) data.number_of_employees = Number(data.number_of_employees);

  const parsed = borrowerSchema.safeParse(data);
  
  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: 'Validation failed. Please check the form.',
    };
  }

  const payload = parsed.data;

  // Check unique PAN
  const { data: existing } = await supabase
    .from('borrowers')
    .select('id')
    .eq('pan_number', payload.pan_number)
    .single();

  if (existing) {
    return {
      errors: { pan_number: ['PAN number already registered'] },
      message: 'PAN number already exists.',
    };
  }

  let newId: number;

  try {
    const { data: inserted, error } = await supabase
      .from('borrowers')
      .insert({
        name: payload.name,
        type: payload.type,
        pan_number: payload.pan_number,
        citizenship_number: payload.citizenship_number || null,
        registration_number: payload.registration_number || null,
        address: payload.address,
        district: payload.district,
        phone: payload.phone,
        email: payload.email || null,
        sector: payload.sector,
        sub_sector: payload.sub_sector || null,
        annual_turnover: payload.annual_turnover || null,
        years_in_business: payload.years_in_business || null,
        number_of_employees: payload.number_of_employees || null,
        created_by: session.id
      })
      .select('id')
      .single();

    if (error || !inserted) {
      console.error('Insert error:', error);
      throw new Error('Failed to retrieve inserted ID');
    }
    
    newId = inserted.id;

    await auditLog({
      entityType: 'borrower',
      entityId: newId,
      action: 'create',
      after: payload as Record<string, unknown>,
      actorId: session.id,
    });

  } catch (error: any) {
    console.error('Create borrower error:', error);
    return { message: 'Database error occurred while creating borrower.' };
  }

  revalidatePath('/borrowers');
  redirect(`/borrowers/${newId}`);
}
