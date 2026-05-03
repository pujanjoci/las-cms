import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET() {
  try {
    // Fetch departments and users in parallel
    const [deptRes, userRes] = await Promise.all([
      supabase.from('departments').select('*'),
      supabase.from('users').select('dept_id')
    ]);

    const { data: departments, error: deptError } = deptRes;
    const { data: users, error: userError } = userRes;

    if (deptError) throw deptError;
    if (userError) throw userError;


    // Map users to departments with details
    const deptUsersMap = (users || []).reduce((acc: any, user: any) => {
      if (user.dept_id) {
        if (!acc[user.dept_id]) acc[user.dept_id] = [];
        acc[user.dept_id].push(user);
      }
      return acc;
    }, {});

    // Build hierarchy
    const buildTree = (list: any[], parentId: string | null = null): any[] => {
      return list
        .filter(item => {
          if (parentId === null) {
            return !item.parent_id || item.parent_id === '';
          }
          return item.parent_id === parentId;
        })
        .map(item => ({
          ...item,
          users: deptUsersMap[item.id] || [],
          user_count: deptUsersMap[item.id]?.length || 0,
          children: buildTree(list, item.id)
        }));
    };

    const tree = buildTree(departments || []);
    console.log(`Successfully built tree with ${tree.length} root nodes`);
    return NextResponse.json(tree);
  } catch (error: any) {
    console.error('DEPARTMENTS_GET_ERROR_STACK:', error.stack || error);
    return NextResponse.json({ 
      error: error.message,
      details: error.details,
      hint: error.hint
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { dept_code, dept_name, parent_id, level } = body;
    
    const { data: newDept, error } = await supabase
      .from('departments')
      .insert([{
        dept_code,
        dept_name,
        parent_id: parent_id || null,
        level: level || 1
      }])
      .select()
      .single();
    
    if (error) throw error;
    return NextResponse.json(newDept);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
