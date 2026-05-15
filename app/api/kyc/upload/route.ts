import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

const BUCKET = 'kyc-documents';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const borrowerId = formData.get('borrower_id') as string | null;
    const documentType = formData.get('document_type') as string | null;
    const userId = formData.get('user_id') as string | null;

    // ── Validation ──────────────────────────────────────────────────────────
    if (!file || !borrowerId || !documentType) {
      return NextResponse.json(
        { error: 'Missing required fields: file, borrower_id, document_type' },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type "${file.type}". Allowed: JPEG, PNG, PDF` },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum: 10 MB` },
        { status: 400 }
      );
    }

    // ── Upload to Supabase Storage ──────────────────────────────────────────
    const fileExt = file.name.split('.').pop() || 'bin';
    const storagePath = `${borrowerId}/${documentType}/${uuidv4()}.${fileExt}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('STORAGE_UPLOAD_ERROR:', uploadError);
      return NextResponse.json(
        { error: `Storage upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // ── Insert record into kyc_documents table ──────────────────────────────
    const { data: doc, error: dbError } = await supabase
      .from('kyc_documents')
      .insert({
        borrower_id: borrowerId,
        document_type: documentType,
        file_name: file.name,
        file_path: storagePath,
        storage_bucket: BUCKET,
        status: 'pending',
        uploaded_by: userId || null,
      })
      .select()
      .single();

    if (dbError) {
      // Cleanup: remove the uploaded file if DB insert fails
      await supabase.storage.from(BUCKET).remove([storagePath]);
      console.error('KYC_DB_INSERT_ERROR:', dbError);
      return NextResponse.json(
        { error: `Database insert failed: ${dbError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: doc });
  } catch (error: any) {
    console.error('KYC_UPLOAD_ERROR:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
