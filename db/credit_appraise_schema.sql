-- ─────────────────────────────────────────────────────────────────────────────
-- CreditAppraise — Margin Lending Schema Extensions
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Eligible Scripts Master ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS eligible_scripts (
  symbol       VARCHAR(20) PRIMARY KEY,
  name         VARCHAR(255) NOT NULL,
  sector       VARCHAR(100) NOT NULL,
  latest_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
  avg_120_day  NUMERIC(15, 2) NOT NULL DEFAULT 0,
  haircut_pct  NUMERIC(5, 2) NOT NULL DEFAULT 50.00,
  script_type  VARCHAR(50) NOT NULL DEFAULT 'ordinary' CHECK(script_type IN ('ordinary', 'promoter', 'mutual_fund', 'debenture')),
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── Appraisal Cases ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appraisal_cases (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number         VARCHAR(50) NOT NULL UNIQUE,
  borrower_id         INTEGER REFERENCES borrowers(id),
  
  -- Step 1 & 2 data (Borrower & Financial)
  proposed_limit      NUMERIC(15, 2) NOT NULL,
  existing_exposure   NUMERIC(15, 2) NOT NULL DEFAULT 0,
  tenure_months       INTEGER NOT NULL DEFAULT 12,
  interest_rate_pct   NUMERIC(5, 2) NOT NULL,
  processing_fee_pct  NUMERIC(5, 2) NOT NULL,
  
  -- Step 3 (Facility)
  facility_type       VARCHAR(100) NOT NULL,
  loan_purpose        TEXT NOT NULL,
  repayment_source    TEXT NOT NULL,
  
  -- Workflow
  status              VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'pending_supporter', 'pending_reviewer', 'pending_approver', 'approved', 'returned', 'rejected')),
  current_stage       VARCHAR(50) NOT NULL DEFAULT 'initiator',
  
  -- Summary
  total_market_value   NUMERIC(15, 2) NOT NULL DEFAULT 0,
  total_eligible_value NUMERIC(15, 2) NOT NULL DEFAULT 0,
  ltv_ratio_pct        NUMERIC(5, 2) NOT NULL DEFAULT 0,
  
  initiator_remarks    TEXT,
  created_by           INTEGER NOT NULL REFERENCES users(id),
  created_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── Collateral Breakdown (Scripts) ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appraisal_collateral (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appraisal_id       UUID NOT NULL REFERENCES appraisal_cases(id) ON DELETE CASCADE,
  script_symbol      VARCHAR(20) NOT NULL REFERENCES eligible_scripts(symbol),
  quantity           INTEGER NOT NULL,
  valuation_price    NUMERIC(15, 2) NOT NULL,
  haircut_pct        NUMERIC(5, 2) NOT NULL,
  market_value       NUMERIC(15, 2) NOT NULL,
  eligible_value     NUMERIC(15, 2) NOT NULL,
  created_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── Credit Memos ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS credit_memos (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_no        VARCHAR(50) NOT NULL UNIQUE,
  appraisal_id        UUID REFERENCES appraisal_cases(id),
  applicant_name      VARCHAR(255) NOT NULL,
  applicant_cif       VARCHAR(50) NOT NULL,
  branch              VARCHAR(255) NOT NULL,
  facility_type       VARCHAR(100) NOT NULL,
  proposed_amount     NUMERIC(15, 2) NOT NULL,
  existing_exposure   NUMERIC(15, 2) NOT NULL,
  purpose             TEXT NOT NULL,
  
  -- Risk Assessment
  risk_score          INTEGER CHECK(risk_score >= 0 AND risk_score <= 100),
  risk_grade          VARCHAR(10) NOT NULL,
  collateral_coverage_pct NUMERIC(10, 2) NOT NULL,
  
  narrative           TEXT NOT NULL,
  conditions          TEXT[] NOT NULL DEFAULT '{}',
  
  status              VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'pending_review', 'under_review', 'approved', 'rejected')),
  review_remarks      TEXT,
  reviewed_by         INTEGER REFERENCES users(id),
  reviewed_at         TIMESTAMP WITH TIME ZONE,
  
  created_by           INTEGER NOT NULL REFERENCES users(id),
  created_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── Policy Configuration ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS credit_policy (
  id                  SERIAL PRIMARY KEY,
  max_ltv_ordinary_pct NUMERIC(5, 2) NOT NULL DEFAULT 65.00,
  max_ltv_promoter_pct NUMERIC(5, 2) NOT NULL DEFAULT 50.00,
  single_borrower_limit_pct_of_capital NUMERIC(5, 2) NOT NULL DEFAULT 10.00,
  total_ml_cap_pct_of_capital NUMERIC(5, 2) NOT NULL DEFAULT 25.00,
  memo_min_collateral_coverage_pct NUMERIC(10, 2) NOT NULL DEFAULT 130.00,
  updated_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── Seed Initial Policy ───────────────────────────────────────────────────────
INSERT INTO credit_policy (max_ltv_ordinary_pct, max_ltv_promoter_pct) 
VALUES (65.00, 50.00) 
ON CONFLICT DO NOTHING;

-- ── Seed Some Initial Scripts for Testing ─────────────────────────────────────
INSERT INTO eligible_scripts (symbol, name, sector, latest_price, avg_120_day, haircut_pct)
VALUES 
('NABIL', 'Nabil Bank Limited', 'Commercial Bank', 620.00, 580.00, 50.00),
('NICA', 'NIC Asia Bank Limited', 'Commercial Bank', 450.00, 480.00, 50.00),
('EBL', 'Everest Bank Limited', 'Commercial Bank', 520.00, 510.00, 50.00),
('GBIME', 'Global IME Bank Limited', 'Commercial Bank', 210.00, 225.00, 50.00)
ON CONFLICT (symbol) DO UPDATE SET latest_price = EXCLUDED.latest_price, avg_120_day = EXCLUDED.avg_120_day;
