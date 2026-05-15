-- Add missing created_by columns to tables that might have been created before the column was added
ALTER TABLE borrowers ADD COLUMN IF NOT EXISTS created_by TEXT REFERENCES users(id);
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS created_by TEXT REFERENCES users(id);
ALTER TABLE proposal_versions ADD COLUMN IF NOT EXISTS created_by TEXT REFERENCES users(id);
ALTER TABLE appraisal_cases ADD COLUMN IF NOT EXISTS created_by TEXT REFERENCES users(id);
ALTER TABLE credit_memos ADD COLUMN IF NOT EXISTS created_by TEXT REFERENCES users(id);
