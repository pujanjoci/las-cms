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
    .select('id, username, password_hash, is_active')
    .eq('username', username)
    .single();

  if (error || !user || !user.is_active) {
    return { message: 'Invalid credentials or inactive account' };
  }

  // Verify password
  if (!verifyPassword(password, user.password_hash)) {
    await auditLog({
      entityType: 'user',
      entityId: user.id,
      action: 'failed_login',
      actorId: user.id,
    });
    return { message: 'Invalid credentials' };
  }

  // Update last login
  await supabase
    .from('users')
    .update({ last_login: new Date().toISOString() })
    .eq('id', user.id);

  // Create session
  await createSession(user.id, user.username);
  
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
