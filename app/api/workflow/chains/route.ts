import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET() {
  try {
    const { data: chains, error } = await supabase
      .from('approval_chains')
      .select(`
        *,
        approval_stages (
          *,
          departments (dept_name),
          roles (name)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formattedChains = chains?.map(chain => ({
      ...chain,
      facility_types: typeof chain.facility_types === 'string' ? JSON.parse(chain.facility_types) : chain.facility_types,
      stages: chain.approval_stages?.sort((a: any, b: any) => a.stage_order - b.stage_order).map((s: any) => ({
        ...s,
        dept_name: s.departments?.dept_name,
        role_name: s.roles?.name
      }))
    }));

    return NextResponse.json(formattedChains);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { chain_name, facility_types, created_by } = body;
    
    const { data: newChain, error } = await supabase
      .from('approval_chains')
      .insert([{
        chain_name,
        facility_types: facility_types || [],
        created_by: created_by || null
      }])
      .select()
      .single();
    
    if (error) throw error;
    return NextResponse.json(newChain);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
