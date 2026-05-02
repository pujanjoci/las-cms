import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const entity_type = searchParams.get('entity_type');
    const action = searchParams.get('action');
    const user_id = searchParams.get('user_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' });

    if (entity_type) query = query.eq('entity_type', entity_type);
    if (action) query = query.eq('action', action);
    if (user_id) query = query.eq('user_id', user_id);

    const { data: logs, error, count } = await query
      .order('logged_at', { ascending: false })
      .range(start, end);

    if (error) throw error;

    return NextResponse.json({
      data: logs,
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

export async function POST() { return new NextResponse(null, { status: 405 }); }
export async function PUT() { return new NextResponse(null, { status: 405 }); }
export async function PATCH() { return new NextResponse(null, { status: 405 }); }
export async function DELETE() { return new NextResponse(null, { status: 405 }); }
