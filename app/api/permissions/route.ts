import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET() {
  try {
    const { data: permissions, error } = await supabase
      .from('permissions')
      .select('*');

    if (error) throw error;
    return NextResponse.json(permissions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
