-- ============================================================
-- CMS Core Infrastructure — PostgreSQL (Supabase)
-- CLEAN SLATE RESET
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist to ensure correct schema (SAFE MODE: CASCADE)
-- We only drop the new tables and junction tables. 
-- We do NOT drop 'users' or 'borrowers' to preserve data, but we will ALTER them.
DROP TABLE IF EXISTS pending_approvals CASCADE;
DROP TABLE IF EXISTS workflow_actions CASCADE;
DROP TABLE IF EXISTS workflow_instances CASCADE;
DROP TABLE IF EXISTS approval_stages CASCADE;
DROP TABLE IF EXISTS approval_chains CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- ============================================================
-- DEPARTMENTS
-- ============================================================
CREATE TABLE departments (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dept_code    VARCHAR(50) UNIQUE NOT NULL,
  dept_name    VARCHAR(255) NOT NULL,
  parent_id    UUID REFERENCES departments(id),
  level        INTEGER NOT NULL DEFAULT 1,
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- ROLES
-- ============================================================
CREATE TABLE roles (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(255) NOT NULL UNIQUE,
  role_code    VARCHAR(50) UNIQUE,
  description  TEXT NOT NULL DEFAULT '',
  dept_id      UUID REFERENCES departments(id),
  can_initiate BOOLEAN DEFAULT FALSE,
  can_review   BOOLEAN DEFAULT FALSE,
  can_recommend BOOLEAN DEFAULT FALSE,
  can_approve  BOOLEAN DEFAULT FALSE,
  can_override BOOLEAN DEFAULT FALSE,
  is_admin     BOOLEAN DEFAULT FALSE,
  approval_limit_min NUMERIC DEFAULT 0,
  approval_limit_max NUMERIC,
  permissions  JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- USERS (FORCE CLEAN SLATE)
-- ============================================================
DROP TABLE IF EXISTS users CASCADE; 

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username      VARCHAR(255) NOT NULL UNIQUE,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name     VARCHAR(255) NOT NULL,
  employee_code VARCHAR(50) UNIQUE,
  branch        VARCHAR(255),
  designation   VARCHAR(255),
  status        VARCHAR(20) DEFAULT 'active',
  is_active     INTEGER NOT NULL DEFAULT 1,
  dept_id       UUID, -- Will link after departments created
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- USERS (SAFE UPDATE)
-- ============================================================
-- Add missing columns to existing users table if it exists
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='dept_id') THEN
    ALTER TABLE users ADD COLUMN dept_id UUID REFERENCES departments(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='employee_code') THEN
    ALTER TABLE users ADD COLUMN employee_code VARCHAR(50) UNIQUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='status') THEN
    ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'active';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='branch') THEN
    ALTER TABLE users ADD COLUMN branch VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='designation') THEN
    ALTER TABLE users ADD COLUMN designation VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='is_active') THEN
    ALTER TABLE users ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='full_name') THEN
    ALTER TABLE users ADD COLUMN full_name VARCHAR(255);
  END IF;
END $$;

-- ============================================================
-- USER ROLES (M:M)
-- ============================================================
CREATE TABLE user_roles (
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id    INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  dept_id    UUID REFERENCES departments(id),
  assigned_by UUID REFERENCES users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role_id)
);

-- ============================================================
-- PERMISSIONS
-- ============================================================
CREATE TABLE permissions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  permission_code VARCHAR(100) UNIQUE NOT NULL,
  description     TEXT,
  module          VARCHAR(50) NOT NULL
);

-- ============================================================
-- BORROWERS & PROPOSALS (Ensure columns exist)
-- ============================================================
-- If you need to reset these, uncomment the drop statements
-- DROP TABLE IF EXISTS proposals CASCADE;
-- DROP TABLE IF EXISTS borrowers CASCADE;

CREATE TABLE IF NOT EXISTS borrowers (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  borrower_code       VARCHAR(100) UNIQUE NOT NULL,
  name                VARCHAR(255) NOT NULL,
  type                VARCHAR(50) DEFAULT 'individual',
  status              VARCHAR(20) DEFAULT 'active', -- active | inactive | blacklisted
  pan_number          VARCHAR(20) UNIQUE,
  citizenship_number  VARCHAR(50),
  registration_number VARCHAR(50),
  address             TEXT,
  district            VARCHAR(100),
  phone               VARCHAR(20),
  email               VARCHAR(255),
  sector              VARCHAR(100),
  sub_sector          VARCHAR(100),
  annual_turnover     NUMERIC(15, 2),
  years_in_business   INTEGER,
  number_of_employees INTEGER,
  created_by          UUID REFERENCES users(id),
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS facilities (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  borrower_id      UUID NOT NULL REFERENCES borrowers(id),
  facility_type    VARCHAR(100) NOT NULL,
  amount           NUMERIC NOT NULL,
  currency         VARCHAR(10) DEFAULT 'NPR',
  interest_rate    NUMERIC(5, 2),
  tenor_months     INTEGER,
  expiry_date      DATE,
  status           VARCHAR(50) DEFAULT 'active',
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS proposals (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_number  VARCHAR(100) UNIQUE NOT NULL,
  borrower_id      UUID NOT NULL REFERENCES borrowers(id),
  proposal_type    VARCHAR(50) DEFAULT 'fresh', -- fresh | renewal | enhancement
  facility_type    VARCHAR(100),
  amount           NUMERIC NOT NULL,
  currency         VARCHAR(10) DEFAULT 'NPR',
  status           VARCHAR(50) DEFAULT 'draft',
  created_by       UUID REFERENCES users(id),
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- CREDIT MEMOS
-- ============================================================
CREATE TABLE IF NOT EXISTS credit_memos (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_no        VARCHAR(50) NOT NULL UNIQUE,
  applicant_name      VARCHAR(255) NOT NULL,
  applicant_cif       VARCHAR(50) NOT NULL,
  branch              VARCHAR(255) NOT NULL,
  facility_type       VARCHAR(100) NOT NULL,
  proposed_amount     NUMERIC(15, 2) NOT NULL,
  existing_exposure   NUMERIC(15, 2) NOT NULL DEFAULT 0,
  purpose             TEXT NOT NULL DEFAULT 'Credit facility',
  risk_grade          VARCHAR(10) NOT NULL,
  collateral_coverage_pct NUMERIC(10, 2) NOT NULL,
  narrative           TEXT NOT NULL,
  status              VARCHAR(50) NOT NULL DEFAULT 'draft',
  created_by          UUID REFERENCES users(id),
  reviewed_by         UUID REFERENCES users(id),
  reviewed_at         TIMESTAMP WITH TIME ZONE,
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- WORKFLOW ENGINE
-- ============================================================

CREATE TABLE IF NOT EXISTS approval_chains (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chain_name     VARCHAR(255) NOT NULL,
  facility_types JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active      BOOLEAN DEFAULT TRUE,
  created_by     UUID REFERENCES users(id),
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE approval_stages (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chain_id         UUID NOT NULL REFERENCES approval_chains(id) ON DELETE CASCADE,
  stage_order      INTEGER NOT NULL,
  stage_name       VARCHAR(255) NOT NULL,
  dept_id          UUID NOT NULL REFERENCES departments(id),
  required_role_id INTEGER NOT NULL REFERENCES roles(id),
  amount_min       NUMERIC DEFAULT 0,
  amount_max       NUMERIC,
  allow_parallel   BOOLEAN DEFAULT FALSE,
  quorum_required  INTEGER DEFAULT 1,
  auto_escalate_days INTEGER DEFAULT 7,
  is_mandatory     BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE workflow_instances (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id     UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  chain_id        UUID NOT NULL REFERENCES approval_chains(id),
  current_stage_id UUID REFERENCES approval_stages(id),
  current_stage_order INTEGER,
  status          VARCHAR(50) DEFAULT 'active',
  initiated_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at    TIMESTAMP WITH TIME ZONE
);

CREATE TABLE workflow_actions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id   UUID NOT NULL REFERENCES workflow_instances(id) ON DELETE CASCADE,
  stage_id      UUID NOT NULL REFERENCES approval_stages(id),
  action_type   VARCHAR(50) NOT NULL,
  action_by     UUID REFERENCES users(id),
  from_stage_order INTEGER,
  to_stage_order   INTEGER,
  remarks       TEXT,
  action_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pending_approvals (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id   UUID NOT NULL REFERENCES workflow_instances(id) ON DELETE CASCADE,
  stage_id      UUID NOT NULL REFERENCES approval_stages(id),
  required_role_id INTEGER NOT NULL REFERENCES roles(id),
  dept_id       UUID NOT NULL REFERENCES departments(id),
  proposal_id   UUID NOT NULL REFERENCES proposals(id),
  assigned_to   UUID REFERENCES users(id),
  due_at        TIMESTAMP WITH TIME ZONE,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES users(id),
  user_name     VARCHAR(255),
  user_role     VARCHAR(255),
  action        VARCHAR(50) NOT NULL,
  entity_type   VARCHAR(50) NOT NULL,
  entity_id     VARCHAR(255),
  entity_label  VARCHAR(255),
  field_name    VARCHAR(255),
  before_value  TEXT,
  after_value   TEXT,
  ip_address    VARCHAR(50),
  user_agent    TEXT,
  session_id    TEXT,
  request_id    TEXT,
  logged_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION block_audit_mutation() RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs records are immutable';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS audit_logs_no_update ON audit_logs;
CREATE TRIGGER audit_logs_no_update BEFORE UPDATE ON audit_logs FOR EACH ROW EXECUTE FUNCTION block_audit_mutation();

DROP TRIGGER IF EXISTS audit_logs_no_delete ON audit_logs;
CREATE TRIGGER audit_logs_no_delete BEFORE DELETE ON audit_logs FOR EACH ROW EXECUTE FUNCTION block_audit_mutation();

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO departments (id, dept_code, dept_name, level) VALUES
  ('00000000-0000-0000-0000-000000000001', 'BRANCH', 'Branch Office', 1),
  ('00000000-0000-0000-0000-000000000002', 'REGIONAL', 'Regional Office', 1),
  ('00000000-0000-0000-0000-000000000003', 'CREDIT', 'Credit Department', 1),
  ('00000000-0000-0000-0000-000000000004', 'RISK', 'Risk Management', 1),
  ('00000000-0000-0000-0000-000000000005', 'COMPLIANCE', 'Compliance Department', 1),
  ('00000000-0000-0000-0000-000000000006', 'BOARD', 'Board of Directors', 1),
  ('00000000-0000-0000-0000-000000000007', 'IT', 'IT Department', 1);

INSERT INTO roles (id, name, role_code, dept_id, is_admin) VALUES
  (1, 'super_admin', 'SADMIN', '00000000-0000-0000-0000-000000000007', TRUE),
  (2, 'admin', 'ADMIN', '00000000-0000-0000-0000-000000000007', TRUE),
  (3, 'initiator', 'MAKER', '00000000-0000-0000-0000-000000000003', FALSE),
  (4, 'reviewer', 'CHECKER', '00000000-0000-0000-0000-000000000003', FALSE),
  (5, 'approver', 'APPROVER', '00000000-0000-0000-0000-000000000003', FALSE),
  (6, 'supporter', 'SUPPORT', '00000000-0000-0000-0000-000000000003', FALSE),
  (7, 'super_staff', 'SSTAFF', '00000000-0000-0000-0000-000000000003', FALSE);

-- ============================================================
-- DEFAULT USERS & TEST ACCOUNTS
-- ============================================================

-- superadmin (Password: SuperAdmin@123)
INSERT INTO users (id, username, email, password_hash, full_name, employee_code, designation, branch, is_active, status, dept_id) VALUES
  ('5e73a217-d9ef-465f-a00c-0fd25677a76c', 'superadmin', 'SuperAdmin@bank.com.np', '$2b$10$ov99Jn3eV0e/HXC6Zug26uHYU5K/o2.HAu6MD/icKkm2dF3rDi.2m', 'System Super Admin', 'EMP-SUPER-01', 'Chief Administrator', 'Head Office', 1, 'active', '00000000-0000-0000-0000-000000000007')
ON CONFLICT (username) DO NOTHING;

-- admin (Password: Admin@123)
INSERT INTO users (id, username, email, password_hash, full_name, employee_code, designation, branch, is_active, status, dept_id) VALUES
  ('c3064d28-ab10-4c46-9190-26875fd0e231', 'admin', 'Admin@bank.com.np', '$2b$10$/POCd/hY9SkydVJx68m.ZuT7YjoqDGWk1pAqkr6fBLBoSLW81NFjK', 'System Admin', 'EMP-ADMIN-01', 'IT Administrator', 'Head Office', 1, 'active', '00000000-0000-0000-0000-000000000007')
ON CONFLICT (username) DO NOTHING;

-- TestUser (Password: test123)
INSERT INTO users (id, username, email, password_hash, full_name, employee_code, designation, branch, is_active, status, dept_id) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'TestUser', 'testuser@bank.com.np', '$2b$10$MoEvRbLXPt/aiieOwW0GIu6aMJpklgQc6.H5WVWDJzewBb5HHuaAW', 'Test User', 'EMP-T101', 'Credit Maker', 'Head Office', 1, 'active', '00000000-0000-0000-0000-000000000003')
ON CONFLICT (username) DO NOTHING;

-- TestUser1 (Password: test123)
INSERT INTO users (id, username, email, password_hash, full_name, employee_code, designation, branch, is_active, status, dept_id) VALUES
  ('b2222222-2222-2222-2222-222222222222', 'TestUser1', 'testuser1@bank.com.np', '$2b$10$MoEvRbLXPt/aiieOwW0GIu6aMJpklgQc6.H5WVWDJzewBb5HHuaAW', 'Test User1', 'EMP-T102', 'Support Officer', 'Kathmandu', 1, 'active', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (username) DO NOTHING;

-- TestUser2 (Password: test123)
INSERT INTO users (id, username, email, password_hash, full_name, branch, is_active, status, dept_id) VALUES
  ('c3333333-3333-3333-3333-333333333333', 'TestUser2', 'testuser2@bank.com.np', '$2b$10$MoEvRbLXPt/aiieOwW0GIu6aMJpklgQc6.H5WVWDJzewBb5HHuaAW', 'Test User2', 'Head Office', 1, 'active', '00000000-0000-0000-0000-000000000003')
ON CONFLICT (username) DO NOTHING;

-- TestUser3 (Password: test123)
INSERT INTO users (id, username, email, password_hash, full_name, branch, is_active, status, dept_id) VALUES
  ('d4444444-4444-4444-4444-444444444444', 'TestUser3', 'testuser3@bank.com.np', '$2b$10$MoEvRbLXPt/aiieOwW0GIu6aMJpklgQc6.H5WVWDJzewBb5HHuaAW', 'Test User3', 'Head Office', 1, 'active', '00000000-0000-0000-0000-000000000003')
ON CONFLICT (username) DO NOTHING;

-- superstaff (Password: test123)
INSERT INTO users (id, username, email, password_hash, full_name, branch, is_active, status, dept_id) VALUES
  ('e5555555-5555-5555-5555-555555555555', 'superstaff', 'superstaff@bank.com.np', '$2b$10$MoEvRbLXPt/aiieOwW0GIu6aMJpklgQc6.H5WVWDJzewBb5HHuaAW', 'Super Staff', 'Head Office', 1, 'active', '00000000-0000-0000-0000-000000000003')
ON CONFLICT (username) DO NOTHING;

-- ROLE ASSIGNMENTS
INSERT INTO user_roles (user_id, role_id, dept_id) VALUES
  ('5e73a217-d9ef-465f-a00c-0fd25677a76c', 1, '00000000-0000-0000-0000-000000000007'), -- superadmin (SADMIN)
  ('c3064d28-ab10-4c46-9190-26875fd0e231', 2, '00000000-0000-0000-0000-000000000007'), -- admin (ADMIN)
  ('a1111111-1111-1111-1111-111111111111', 3, '00000000-0000-0000-0000-000000000003'), -- TestUser (Initiator)
  ('b2222222-2222-2222-2222-222222222222', 6, '00000000-0000-0000-0000-000000000001'), -- TestUser1 (Supporter)
  ('c3333333-3333-3333-3333-333333333333', 4, '00000000-0000-0000-0000-000000000003'), -- TestUser2 (Reviewer)
  ('d4444444-4444-4444-4444-444444444444', 5, '00000000-0000-0000-0000-000000000003'), -- TestUser3 (Approver)
  ('e5555555-5555-5555-5555-555555555555', 7, '00000000-0000-0000-0000-000000000003')  -- superstaff (Super Staff)
ON CONFLICT DO NOTHING;
