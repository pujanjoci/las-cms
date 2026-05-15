import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

type RouteContext = { params: Promise<{ borrowerId: string }> };

export async function GET(_req: Request, ctx: RouteContext) {
  try {
    const { borrowerId } = await ctx.params;

    if (!borrowerId) {
      return NextResponse.json({ error: 'Missing borrower ID' }, { status: 400 });
    }

    const { data: docs, error } = await supabase
      .from('kyc_documents')
      .select('*')
      .eq('borrower_id', borrowerId)
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('KYC_FETCH_ERROR:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Generate signed URLs for each document (valid 1 hour)
    const docsWithUrls = await Promise.all(
      (docs || []).map(async (doc) => {
        const { data: signedUrl } = await supabase.storage
          .from(doc.storage_bucket || 'kyc-documents')
          .createSignedUrl(doc.file_path, 3600);

        return {
          ...doc,
          signed_url: signedUrl?.signedUrl || null,
        };
      })
    );

    return NextResponse.json({ success: true, data: docsWithUrls });
  } catch (error: any) {
    console.error('KYC_GET_ERROR:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, ctx: RouteContext) {
  try {
    const { borrowerId } = await ctx.params;
    const { searchParams } = new URL(req.url);
    const docId = searchParams.get('docId');

    if (!borrowerId || !docId) {
      return NextResponse.json({ error: 'Missing borrower_id or docId' }, { status: 400 });
    }

    // Fetch the document to get the file path
    const { data: doc, error: fetchError } = await supabase
      .from('kyc_documents')
      .select('file_path, storage_bucket')
      .eq('id', docId)
      .eq('borrower_id', borrowerId)
      .single();

    if (fetchError || !doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(doc.storage_bucket || 'kyc-documents')
      .remove([doc.file_path]);

    if (storageError) {
      console.error('KYC_STORAGE_DELETE_ERROR:', storageError);
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('kyc_documents')
      .delete()
      .eq('id', docId);

    if (dbError) {
      console.error('KYC_DB_DELETE_ERROR:', dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('KYC_DELETE_ERROR:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
