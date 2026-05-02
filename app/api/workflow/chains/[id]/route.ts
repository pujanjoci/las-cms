import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const chainId = params.id;
    const body = await req.json();
    const { chain_name, is_active, facility_types } = body;

    const { data: updatedChain, error } = await supabase
      .from('approval_chains')
      .update({
        chain_name,
        is_active,
        facility_types: facility_types || []
      })
      .eq('id', chainId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(updatedChain);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const chainId = params.id;
    const { error } = await supabase
      .from('approval_chains')
      .delete()
      .eq('id', chainId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
