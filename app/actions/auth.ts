'use server';

import { loginSchema } from '@/lib/validators';
import { supabase } from '@/lib/db';
import { verifyPassword, createSession, deleteSession } from '@/lib/auth';
import { auditLog } from '@/lib/audit';
import { redirect } from 'next/navigation';

export async function loginAction(prevState: any, formData: FormData) {
  // Validate input
  const data = Object.fromEntries(formData.entries());
  const parsed = loginSchema.safeParse(data);
  
  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: 'Invalid input. Please check the fields.',
    };
  }

  const { username, password } = parsed.data;

  // HARDCODED BYPASS USER FOR TESTING
  if (username === 'testadmin' && password === 'test123') {
    await createSession(9999, 'testadmin');
    redirect('/dashboard');
  }

  // Find user
  const { data: user, error } = await supabase
    .from('users')
    .select('id, employee_code, password_hash, status')
    .or(`employee_code.ilike.${username},email.ilike.${username}`)
    .single();

  console.log('Login attempt:', { username, userFound: !!user, error: error?.message, status: user?.status });
  if (error || !user || user.status !== 'active') {
    return { message: `Invalid credentials or inactive account (${error?.message || (user ? 'inactive' : 'not found')})` };
  }

  // Verify password
  const isMatch = verifyPassword(password, user.password_hash);
  console.log('Password match:', isMatch);
  if (!isMatch) {
    await auditLog({
      entityType: 'user',
      entityId: user.id,
      action: 'failed_login',
      actorId: user.id,
    });
    return { message: 'Invalid credentials (password mismatch)' };
  }

  // Update last login
  await supabase
    .from('users')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', user.id);

  // Create session
  await createSession(user.id, user.employee_code);
  
  await auditLog({
    entityType: 'user',
    entityId: user.id,
    action: 'login',
    actorId: user.id,
  });

  redirect('/dashboard');
}

export async function logoutAction() {
  await deleteSession();
  redirect('/login');
}
