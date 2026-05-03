import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const body = await req.json();
    const { role_id, dept_id } = body;
    
    const { data: userRole, error } = await supabase
      .from('user_roles')
      .insert([{
        user_id: userId,
        role_id,
        dept_id
      }])
      .select()
      .single();
    
    if (error) throw error;
    return NextResponse.json(userRole);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
