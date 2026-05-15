-- ============================================================================
-- ALTER borrowers TABLE
-- ============================================================================
-- Current columns:  id (text), borrower_code (varchar), full_name (varchar), created_at (timestamp)
-- Target:           All columns required by the CMS Portal application
--
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================================

-- ── Step 1: Rename existing columns to match app expectations ─────────────────
-- The app uses "name" not "full_name"
ALTER TABLE borrowers RENAME COLUMN full_name TO name;

-- ── Step 2: Add missing columns ───────────────────────────────────────────────
ALTER TABLE borrowers
  ADD COLUMN IF NOT EXISTS type                VARCHAR(50)    DEFAULT 'individual',
  ADD COLUMN IF NOT EXISTS status              VARCHAR(20)    DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS pan_number          VARCHAR(20),
  ADD COLUMN IF NOT EXISTS citizenship_number  VARCHAR(50),
  ADD COLUMN IF NOT EXISTS registration_number VARCHAR(50),
  ADD COLUMN IF NOT EXISTS address             TEXT,
  ADD COLUMN IF NOT EXISTS district            VARCHAR(100),
  ADD COLUMN IF NOT EXISTS phone               VARCHAR(20),
  ADD COLUMN IF NOT EXISTS email               VARCHAR(255),
  ADD COLUMN IF NOT EXISTS sector              VARCHAR(100),
  ADD COLUMN IF NOT EXISTS sub_sector          VARCHAR(100),
  ADD COLUMN IF NOT EXISTS annual_turnover     NUMERIC(15, 2),
  ADD COLUMN IF NOT EXISTS years_in_business   INTEGER,
  ADD COLUMN IF NOT EXISTS number_of_employees INTEGER,
  ADD COLUMN IF NOT EXISTS created_by          TEXT,
  ADD COLUMN IF NOT EXISTS updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- ── Step 3: Add unique constraint on PAN ──────────────────────────────────────
-- (only if no duplicate PAN values exist — safe for an empty or clean table)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'borrowers_pan_number_key'
  ) THEN
    ALTER TABLE borrowers ADD CONSTRAINT borrowers_pan_number_key UNIQUE (pan_number);
  END IF;
END $$;

-- ── Step 4: Create indexes for fast lookups ───────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_borrowers_pan        ON borrowers(pan_number);
CREATE INDEX IF NOT EXISTS idx_borrowers_status     ON borrowers(status);
CREATE INDEX IF NOT EXISTS idx_borrowers_name       ON borrowers(name);
CREATE INDEX IF NOT EXISTS idx_borrowers_code       ON borrowers(borrower_code);

-- ── Step 5: Auto-update updated_at on row change ─────────────────────────────
CREATE OR REPLACE FUNCTION update_borrowers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_borrowers_updated_at ON borrowers;
CREATE TRIGGER trg_borrowers_updated_at
  BEFORE UPDATE ON borrowers
  FOR EACH ROW
  EXECUTE FUNCTION update_borrowers_updated_at();

-- ── Verify ────────────────────────────────────────────────────────────────────
-- Run this after the migration to confirm the new structure:
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'borrowers'
-- ORDER BY ordinal_position;
