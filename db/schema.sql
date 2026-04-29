-- ─────────────────────────────────────────────────────────────────────────────
-- CMS Portal Database Schema — PostgreSQL (Supabase)
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Roles ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roles (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb, -- JSON array of permission strings
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── Users ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(255) NOT NULL UNIQUE,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name     VARCHAR(255) NOT NULL,
  branch        VARCHAR(255),
  designation   VARCHAR(255),
  is_active     INTEGER NOT NULL DEFAULT 1,
  mfa_enabled   INTEGER NOT NULL DEFAULT 0,
  last_login    TIMESTAMP WITH TIME ZONE,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── User Roles (M:M) ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_roles (
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id    INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by INTEGER REFERENCES users(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role_id)
);

-- ── Borrowers ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS borrowers (
  id                   SERIAL PRIMARY KEY,
  name                 VARCHAR(255) NOT NULL,
  type                 VARCHAR(50) NOT NULL CHECK(type IN ('individual','proprietorship','partnership','private_limited','public_limited','cooperative','ngo')),
  pan_number           VARCHAR(100) NOT NULL UNIQUE,
  citizenship_number   VARCHAR(100) UNIQUE,
  registration_number  VARCHAR(100) UNIQUE,
  address              TEXT NOT NULL,
  district             VARCHAR(100) NOT NULL DEFAULT 'Kathmandu',
  phone                VARCHAR(50) NOT NULL,
  email                VARCHAR(255),
  sector               VARCHAR(100) NOT NULL,
  sub_sector           VARCHAR(100),
  group_id             INTEGER,
  group_name           VARCHAR(255),
  annual_turnover      NUMERIC(15, 2),
  years_in_business    INTEGER,
  number_of_employees  INTEGER,
  status               VARCHAR(50) NOT NULL DEFAULT 'active' CHECK(status IN ('active','inactive','blacklisted','under_review')),
  nrb_classification   VARCHAR(50) DEFAULT 'pass',
  created_by           INTEGER NOT NULL REFERENCES users(id),
  created_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── KYC Documents ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kyc_documents (
  id             SERIAL PRIMARY KEY,
  borrower_id    INTEGER NOT NULL REFERENCES borrowers(id) ON DELETE CASCADE,
  document_type  VARCHAR(100) NOT NULL,
  file_name      VARCHAR(255) NOT NULL,
  file_path      TEXT NOT NULL,
  storage_bucket VARCHAR(100) NOT NULL DEFAULT 'kyc-documents',
  status         VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','verified','rejected','expired')),
  verified_by    INTEGER REFERENCES users(id),
  verified_at    TIMESTAMP WITH TIME ZONE,
  expiry_date    DATE,
  remarks        TEXT,
  uploaded_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── Facilities ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS facilities (
  id               SERIAL PRIMARY KEY,
  borrower_id      INTEGER NOT NULL REFERENCES borrowers(id),
  facility_type    VARCHAR(100) NOT NULL,
  amount           NUMERIC(15, 2) NOT NULL,
  currency         VARCHAR(10) NOT NULL DEFAULT 'NPR',
  tenor_months     INTEGER NOT NULL,
  interest_rate    NUMERIC(5, 2) NOT NULL,
  purpose          TEXT NOT NULL,
  collateral_type  VARCHAR(100) NOT NULL,
  collateral_value NUMERIC(15, 2) NOT NULL,
  ltv_ratio        NUMERIC(5, 2) NOT NULL,
  status           VARCHAR(50) NOT NULL DEFAULT 'active',
  sanction_date    DATE,
  expiry_date      DATE,
  created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── Proposals ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS proposals (
  id                SERIAL PRIMARY KEY,
  borrower_id       INTEGER NOT NULL REFERENCES borrowers(id),
  facility_id       INTEGER REFERENCES facilities(id),
  proposal_number   VARCHAR(100) NOT NULL UNIQUE,
  proposal_type     VARCHAR(50) NOT NULL DEFAULT 'fresh',
  amount            NUMERIC(15, 2) NOT NULL,
  currency          VARCHAR(10) NOT NULL DEFAULT 'NPR',
  purpose           TEXT NOT NULL,
  financial_data    JSONB,         
  collateral_data   JSONB,         
  management_data   JSONB,         
  business_data     JSONB,         
  status            VARCHAR(50) NOT NULL DEFAULT 'draft',
  priority          VARCHAR(50) DEFAULT 'normal',
  target_close_date DATE,
  created_by        INTEGER NOT NULL REFERENCES users(id),
  created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── Proposal Versions ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS proposal_versions (
  id             SERIAL PRIMARY KEY,
  proposal_id    INTEGER NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  snapshot       JSONB NOT NULL,   -- JSON of full proposal state
  change_summary TEXT,
  created_by     INTEGER NOT NULL REFERENCES users(id),
  created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(proposal_id, version_number)
);

-- ── Risk Scores ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS risk_scores (
  id                  SERIAL PRIMARY KEY,
  proposal_id         INTEGER NOT NULL REFERENCES proposals(id),
  financial_score     NUMERIC(5, 2) NOT NULL,
  business_score      NUMERIC(5, 2) NOT NULL,
  management_score    NUMERIC(5, 2) NOT NULL,
  collateral_score    NUMERIC(5, 2) NOT NULL,
  industry_score      NUMERIC(5, 2) NOT NULL,
  weighted_total      NUMERIC(5, 2) NOT NULL,
  risk_grade          VARCHAR(5) NOT NULL CHECK(risk_grade IN ('A','B','C','D','E')),
  dscr                NUMERIC(10, 2) NOT NULL,
  ltv                 NUMERIC(10, 2) NOT NULL,
  group_exposure_pct  NUMERIC(5, 2) NOT NULL DEFAULT 0,
  hard_stops          JSONB NOT NULL DEFAULT '[]'::jsonb, -- JSON
  decision            VARCHAR(50) NOT NULL CHECK(decision IN ('approve','review','decline')),
  scored_by           INTEGER NOT NULL REFERENCES users(id),
  scored_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── Risk Overrides ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS risk_overrides (
  id             SERIAL PRIMARY KEY,
  risk_score_id  INTEGER NOT NULL REFERENCES risk_scores(id),
  original_grade VARCHAR(5) NOT NULL,
  override_grade VARCHAR(5) NOT NULL,
  justification  TEXT NOT NULL,
  approved_by    INTEGER NOT NULL REFERENCES users(id),
  approved_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── Workflow Instances ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workflow_instances (
  id             SERIAL PRIMARY KEY,
  proposal_id    INTEGER NOT NULL UNIQUE REFERENCES proposals(id),
  current_stage  VARCHAR(50) NOT NULL DEFAULT 'draft',
  previous_stage VARCHAR(50),
  assigned_to    INTEGER REFERENCES users(id),
  escalated      INTEGER NOT NULL DEFAULT 0,
  due_date       DATE,
  created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── Workflow Actions ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workflow_actions (
  id          SERIAL PRIMARY KEY,
  workflow_id INTEGER NOT NULL REFERENCES workflow_instances(id),
  from_stage  VARCHAR(50) NOT NULL,
  to_stage    VARCHAR(50) NOT NULL,
  action_type VARCHAR(50) NOT NULL CHECK(action_type IN ('submit','forward','approve','return','query','escalate','cancel')),
  actor_id    INTEGER NOT NULL REFERENCES users(id),
  remarks     TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── Audit Logs (append-only) ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id           SERIAL PRIMARY KEY,
  entity_type  VARCHAR(100) NOT NULL,
  entity_id    INTEGER NOT NULL,
  action       VARCHAR(100) NOT NULL,
  before_value JSONB,
  after_value  JSONB,
  actor_id     INTEGER NOT NULL REFERENCES users(id),
  ip_address   VARCHAR(45),
  user_agent   TEXT,
  created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── Settings (configurable business rules) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  id          SERIAL PRIMARY KEY,
  key         VARCHAR(255) NOT NULL UNIQUE,
  value       TEXT NOT NULL,
  category    VARCHAR(100) NOT NULL DEFAULT 'general',
  label       VARCHAR(255) NOT NULL,
  description TEXT,
  updated_by  INTEGER REFERENCES users(id),
  updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── Collateral Register ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS collateral_register (
  id                  SERIAL PRIMARY KEY,
  facility_id         INTEGER NOT NULL REFERENCES facilities(id),
  collateral_type     VARCHAR(100) NOT NULL,
  description         TEXT NOT NULL,
  market_value        NUMERIC(15, 2) NOT NULL,
  forced_sale_value   NUMERIC(15, 2) NOT NULL,
  valuation_date      DATE NOT NULL,
  valuator            VARCHAR(255) NOT NULL,
  location            TEXT,
  registration_number VARCHAR(100),
  insurance_amount    NUMERIC(15, 2),
  insurance_company   VARCHAR(255),
  insurance_expiry    DATE,
  status              VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_borrowers_pan        ON borrowers(pan_number);
CREATE INDEX IF NOT EXISTS idx_borrowers_status     ON borrowers(status);
CREATE INDEX IF NOT EXISTS idx_proposals_status     ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_borrower   ON proposals(borrower_id);
CREATE INDEX IF NOT EXISTS idx_proposals_created_by ON proposals(created_by);
CREATE INDEX IF NOT EXISTS idx_workflow_stage       ON workflow_instances(current_stage);
CREATE INDEX IF NOT EXISTS idx_audit_entity         ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor          ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_risk_scores_proposal ON risk_scores(proposal_id);
