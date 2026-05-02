import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET() {
  try {
    const { data: roles, error } = await supabase
      .from('roles')
      .select(`
        *,
        departments (dept_name)
      `);

    if (error) throw error;

    const formattedRoles = roles?.map(role => ({
      ...role,
      role_name: role.name, // UI expects role_name
      dept_name: role.departments?.dept_name
    }));

    return NextResponse.json(formattedRoles);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      name, 
      role_code, 
      description, 
      dept_id, 
      can_initiate, 
      can_review, 
      can_recommend, 
      can_approve, 
      can_override, 
      is_admin,
      approval_limit_min,
      approval_limit_max,
      permissions
    } = body;
    
    const { data: newRole, error } = await supabase
      .from('roles')
      .insert([{
        name,
        role_code,
        description: description || '',
        dept_id,
        can_initiate: !!can_initiate,
        can_review: !!can_review,
        can_recommend: !!can_recommend,
        can_approve: !!can_approve,
        can_override: !!can_override,
        is_admin: !!is_admin,
        approval_limit_min: approval_limit_min || 0,
        approval_limit_max: approval_limit_max || null,
        permissions: permissions || []
      }])
      .select()
      .single();
    
    if (error) throw error;
    return NextResponse.json(newRole);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
