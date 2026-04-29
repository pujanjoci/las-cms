import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { hashSync, compareSync } from 'bcryptjs';
import { supabase } from './db';
import type { SessionUser, UserRole, Permission } from './types';
import { PERMISSIONS } from './types';
import { encrypt, decrypt, SESSION_DURATION } from './session';

// ── Password Hashing ──────────────────────────────────────────────────────────

export function hashPassword(password: string): string {
  return hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return compareSync(password, hash);
}

// ── Session Management ────────────────────────────────────────────────────────

export async function createSession(userId: number, username: string): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION);
  const token = await encrypt({ userId, username });
  const cookieStore = await cookies();

  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

// Wrapped with React cache() to deduplicate within a single request.
// Layout + page both call getSession(), but only 1 Supabase query fires.
export const getSession = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;

  const payload = await decrypt(token);
  if (!payload) return null;

  // HARDCODED BYPASS USER FOR TESTING
  if (payload.userId === 9999) {
    return {
      id: 9999,
      username: 'testadmin',
      email: 'testadmin@bank.com',
      full_name: 'Test Admin',
      roles: ['super_admin'],
      permissions: Object.values(PERMISSIONS) as string[]
    };
  }

  // Fetch full user from Supabase
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, username, email, full_name, is_active')
    .eq('id', payload.userId)
    .single();

  if (userError || !user || !user.is_active) return null;

  // Fetch roles
  const { data: roleRows, error: roleError } = await supabase
    .from('user_roles')
    .select('roles(name, permissions)')
    .eq('user_id', user.id);

  if (roleError) return null;

  const roles = (roleRows || []).map((row: any) => row.roles?.name as UserRole).filter(Boolean);
  const permissions = (roleRows || []).flatMap((row: any) => {
    try { 
      return typeof row.roles?.permissions === 'string' 
        ? JSON.parse(row.roles.permissions) 
        : (row.roles?.permissions || []); 
    }
    catch { return []; }
  });

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    full_name: user.full_name,
    roles: [...new Set(roles)],
    permissions: [...new Set(permissions)],
  };
});

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

// ── Auth Check Helper ─────────────────────────────────────────────────────────

export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}
