-- Add uploaded_by column to kyc_documents table
ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS uploaded_by    TEXT REFERENCES users(id);
