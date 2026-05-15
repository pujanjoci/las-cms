-- ── Appraisal Workflow History ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appraisal_workflow_history (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appraisal_id UUID NOT NULL REFERENCES appraisal_cases(id) ON DELETE CASCADE,
  from_stage   VARCHAR(50) NOT NULL,
  to_stage     VARCHAR(50) NOT NULL,
  action_type  VARCHAR(50) NOT NULL, -- e.g., 'advance', 'return', 'reject'
  actor_id     TEXT NOT NULL REFERENCES users(id),
  actor_role   VARCHAR(100), -- Snapshot of role at time of action
  remarks      TEXT DEFAULT '',
  created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups on specific cases
CREATE INDEX IF NOT EXISTS idx_appraisal_history_case ON appraisal_workflow_history(appraisal_id);

-- Enable RLS
ALTER TABLE appraisal_workflow_history ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view history for all cases" 
ON appraisal_workflow_history FOR SELECT 
USING (true);

CREATE POLICY "System can insert history" 
ON appraisal_workflow_history FOR INSERT 
WITH CHECK (true);
