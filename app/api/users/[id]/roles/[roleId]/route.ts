import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string, roleId: string } }
) {
  try {
    const { id: userId, roleId } = params;
    
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .match({ user_id: userId, role_id: roleId });
    
    if (error) throw error;
    
    return NextResponse.json({ message: 'Role assignment removed successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
