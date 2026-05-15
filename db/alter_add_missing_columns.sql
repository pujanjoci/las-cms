-- Add missing columns to workflow_instances that might have been created previously
ALTER TABLE workflow_instances ADD COLUMN IF NOT EXISTS current_stage VARCHAR(50) NOT NULL DEFAULT 'draft';
ALTER TABLE workflow_instances ADD COLUMN IF NOT EXISTS previous_stage VARCHAR(50);
ALTER TABLE workflow_instances ADD COLUMN IF NOT EXISTS assigned_to TEXT REFERENCES users(id);
ALTER TABLE workflow_instances ADD COLUMN IF NOT EXISTS escalated INTEGER NOT NULL DEFAULT 0;
ALTER TABLE workflow_instances ADD COLUMN IF NOT EXISTS due_date DATE;

-- Add missing columns to audit_logs (just in case)
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS entity_type VARCHAR(100);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS entity_id VARCHAR(100);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS actor_id TEXT REFERENCES users(id);

-- Add missing columns to proposals (just in case)
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'draft';
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS borrower_id TEXT REFERENCES borrowers(id);
