import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const pan = searchParams.get('pan')?.trim();
    const q = searchParams.get('q')?.trim();

    // Search by exact PAN match
    if (pan) {
      const { data: borrower, error } = await supabase
        .from('borrowers')
        .select('id, name, type, pan_number, address, district, phone, email, sector, status')
        .eq('pan_number', pan)
        .single();

      if (error || !borrower) {
        return NextResponse.json({ success: false, data: null });
      }
      return NextResponse.json({ success: true, data: borrower });
    }

    // Free text search (name or PAN)
    if (q && q.length >= 2) {
      const { data: results, error } = await supabase
        .from('borrowers')
        .select('id, name, type, pan_number, sector, status')
        .or(`name.ilike.%${q}%,pan_number.ilike.%${q}%`)
        .eq('status', 'active')
        .order('name')
        .limit(10);

      if (error) throw error;
      return NextResponse.json({ success: true, data: results || [] });
    }

    return NextResponse.json({ success: false, error: 'Provide ?pan= or ?q= parameter' }, { status: 400 });
  } catch (error: any) {
    console.error('BORROWER_SEARCH_ERROR:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
