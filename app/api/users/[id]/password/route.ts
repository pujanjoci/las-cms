import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { hashSync } from 'bcryptjs';
import { getSession } from '@/lib/auth';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || !session.roles.includes('super_admin')) {
      return NextResponse.json({ error: 'Unauthorized. Only Super Admin can change passwords.' }, { status: 403 });
    }

    const userId = params.id;
    const body = await req.json();
    const { password } = body;

    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
    }

    // 2. Prevent changing password of other Super Admins
    const { data: targetUserRoles } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', userId);

    const isTargetSuperAdmin = targetUserRoles?.some((ur: any) => ur.roles?.name === 'super_admin');
    if (isTargetSuperAdmin) {
      return NextResponse.json({ error: 'You cannot change the password of another Super Admin.' }, { status: 403 });
    }

    // 3. Hash the new password
    const password_hash = hashSync(password, 10);

    // 3. Update the user
    const { error } = await supabase
      .from('users')
      .update({ password_hash })
      .eq('id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
