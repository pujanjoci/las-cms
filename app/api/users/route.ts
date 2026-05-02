import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { hashSync } from 'bcryptjs';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const { data: users, error, count } = await supabase
      .from('users')
      .select(`
        *,
        departments (dept_name),
        user_roles (
          role_id,
          roles (id, name, role_code),
          departments (id, dept_name)
        )
      `, { count: 'exact' })
      .range(start, end);

    if (error) throw error;

    // Format data to match previous contract
    const formattedUsers = users?.map(user => ({
      ...user,
      dept_name: user.departments?.dept_name,
      roles: user.user_roles?.map((ur: any) => ({
        ...ur.roles,
        role_dept_name: ur.departments?.dept_name
      }))
    }));

    return NextResponse.json({
      data: formattedUsers,
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      employee_code, 
      username,
      full_name, 
      email, 
      phone, 
      password, 
      dept_id, 
      branch 
    } = body;
    
    const password_hash = hashSync(password || 'Bank@123', 10);
    
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{
        username: username || email.split('@')[0],
        employee_code,
        full_name,
        email,
        phone,
        password_hash,
        dept_id,
        branch,
        status: 'active',
        is_active: 1
      }])
      .select()
      .single();
    
    if (error) throw error;
    return NextResponse.json(newUser);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
