-- Clean up existing tables to avoid type mismatches during development
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS feature_toggles CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS pending_approvals CASCADE;
DROP TABLE IF EXISTS workflow_actions CASCADE;
DROP TABLE IF EXISTS workflow_instances CASCADE;
DROP TABLE IF EXISTS approval_stages CASCADE;
DROP TABLE IF EXISTS approval_chains CASCADE;
DROP TABLE IF EXISTS proposals CASCADE;
DROP TABLE IF EXISTS borrowers CASCADE;

-- ============================================================
-- BORROWERS (Base Table)
-- ============================================================
CREATE TABLE IF NOT EXISTS borrowers (
  id           TEXT PRIMARY KEY,
  borrower_code VARCHAR UNIQUE NOT NULL,
  full_name    VARCHAR NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- PROPOSALS (Base Table)
-- ============================================================
CREATE TABLE IF NOT EXISTS proposals (
  id               TEXT PRIMARY KEY,
  proposal_no      VARCHAR UNIQUE NOT NULL,
  borrower_id      TEXT NOT NULL REFERENCES borrowers(id),
  facility_type    VARCHAR NOT NULL,             -- term_loan | overdraft | working_capital
  sanctioned_limit NUMERIC NOT NULL,
  status           VARCHAR DEFAULT 'draft',      -- draft | pending | approved | returned | cancelled
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- DEPARTMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS departments (
  id           TEXT PRIMARY KEY,
  dept_code    VARCHAR UNIQUE NOT NULL,        -- e.g. CREDIT, RISK, COMPLIANCE, OPERATIONS, BOARD
  dept_name    VARCHAR NOT NULL,               -- e.g. "Credit Department"
  parent_id    TEXT REFERENCES departments(id), -- NULL = top-level department
  level        INTEGER NOT NULL DEFAULT 1,     -- hierarchy depth: 1 = top, 2 = sub-dept, 3 = unit
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- ROLES
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
  id           TEXT PRIMARY KEY,
  role_code    VARCHAR UNIQUE NOT NULL,        -- e.g. MAKER, CHECKER, RECOMMENDER, APPROVER, ADMIN
  role_name    VARCHAR NOT NULL,               -- e.g. "Credit Analyst", "Branch Manager"
  dept_id      TEXT REFERENCES departments(id), -- which department this role belongs to
  can_initiate BOOLEAN DEFAULT FALSE,          -- can create proposals
  can_review   BOOLEAN DEFAULT FALSE,          -- can review and add remarks
  can_recommend BOOLEAN DEFAULT FALSE,         -- can formally recommend for approval
  can_approve  BOOLEAN DEFAULT FALSE,          -- can give final approval at their stage
  can_override BOOLEAN DEFAULT FALSE,          -- can override risk scores
  is_admin     BOOLEAN DEFAULT FALSE,          -- can access admin panels and config
  approval_limit_min NUMERIC DEFAULT 0,        -- minimum loan amount this role can approve (NPR)
  approval_limit_max NUMERIC,                  -- maximum loan amount this role can approve (NPR); NULL = no cap
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- PERMISSIONS (granular action-level control)
-- ============================================================
CREATE TABLE IF NOT EXISTS permissions (
  id              TEXT PRIMARY KEY,
  permission_code VARCHAR UNIQUE NOT NULL,     -- e.g. PROPOSAL_CREATE, WORKFLOW_APPROVE, RISK_OVERRIDE
  description     TEXT,
  module          VARCHAR NOT NULL             -- borrowers | proposals | workflow | risk | reports | admin
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id        TEXT NOT NULL REFERENCES roles(id),
  permission_id  TEXT NOT NULL REFERENCES permissions(id),
  PRIMARY KEY (role_id, permission_id)
);

-- ============================================================
-- USERS (extended with department linkage)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  employee_code VARCHAR UNIQUE NOT NULL,
  full_name     VARCHAR NOT NULL,
  email         VARCHAR UNIQUE NOT NULL,
  phone         VARCHAR,
  password_hash TEXT NOT NULL,
  dept_id       TEXT REFERENCES departments(id),
  branch_id     TEXT,                          -- physical branch (optional; used for Branch-level approvals)
  status        VARCHAR DEFAULT 'active',      -- active | inactive | suspended
  mfa_enabled   BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMP,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id    TEXT NOT NULL REFERENCES users(id),
  role_id    TEXT NOT NULL REFERENCES roles(id),
  dept_id    TEXT NOT NULL REFERENCES departments(id), -- which dept this role assignment is for
  assigned_by TEXT REFERENCES users(id),
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role_id, dept_id)
);

-- ============================================================
-- APPROVAL CHAIN CONFIGURATION
-- ============================================================
CREATE TABLE IF NOT EXISTS approval_chains (
  id             TEXT PRIMARY KEY,
  chain_name     VARCHAR NOT NULL,             -- e.g. "Standard Loan Approval Chain"
  facility_types TEXT NOT NULL,                -- JSON array: ["term_loan","overdraft","working_capital"]
  is_active      BOOLEAN DEFAULT TRUE,
  created_by     TEXT REFERENCES users(id),
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS approval_stages (
  id               TEXT PRIMARY KEY,
  chain_id         TEXT NOT NULL REFERENCES approval_chains(id),
  stage_order      INTEGER NOT NULL,           -- 1, 2, 3, 4 — defines the sequence
  stage_name       VARCHAR NOT NULL,           -- e.g. "Branch Review", "Head Office Approval"
  dept_id          TEXT NOT NULL REFERENCES departments(id),
  required_role_id TEXT NOT NULL REFERENCES roles(id),
  amount_min       NUMERIC DEFAULT 0,          -- proposals below this amount skip this stage
  amount_max       NUMERIC,                    -- proposals above this amount escalate beyond; NULL = no cap
  allow_parallel   BOOLEAN DEFAULT FALSE,      -- if TRUE, multiple approvers at this stage can act simultaneously
  quorum_required  INTEGER DEFAULT 1,          -- how many approvers must act for stage to be complete
  auto_escalate_days INTEGER DEFAULT 7,        -- auto-escalate if no action within N days
  is_mandatory     BOOLEAN DEFAULT TRUE,       -- if FALSE, this stage can be skipped by a higher authority
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- WORKFLOW INSTANCES (one per proposal)
-- ============================================================
CREATE TABLE IF NOT EXISTS workflow_instances (
  id              TEXT PRIMARY KEY,
  proposal_id     TEXT NOT NULL REFERENCES proposals(id),
  chain_id        TEXT NOT NULL REFERENCES approval_chains(id),
  current_stage_id TEXT REFERENCES approval_stages(id),
  current_stage_order INTEGER,
  status          VARCHAR DEFAULT 'active',    -- active | completed | returned | cancelled
  initiated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at    TIMESTAMP
);

-- ============================================================
-- WORKFLOW ACTIONS (one row per action taken)
-- ============================================================
CREATE TABLE IF NOT EXISTS workflow_actions (
  id            TEXT PRIMARY KEY,
  workflow_id   TEXT NOT NULL REFERENCES workflow_instances(id),
  stage_id      TEXT NOT NULL REFERENCES approval_stages(id),
  action_type   VARCHAR NOT NULL,              -- submit | approve | return | escalate | query | remark | auto_escalate
  action_by     TEXT REFERENCES users(id),     -- NULL if action_type = auto_escalate
  from_stage_order INTEGER,
  to_stage_order   INTEGER,
  remarks       TEXT,                          -- mandatory for: return, escalate, query
  action_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- PENDING APPROVALS (denormalized for fast queue queries)
-- ============================================================
CREATE TABLE IF NOT EXISTS pending_approvals (
  id            TEXT PRIMARY KEY,
  workflow_id   TEXT NOT NULL REFERENCES workflow_instances(id),
  stage_id      TEXT NOT NULL REFERENCES approval_stages(id),
  required_role_id TEXT NOT NULL REFERENCES roles(id),
  dept_id       TEXT NOT NULL REFERENCES departments(id),
  proposal_id   TEXT NOT NULL REFERENCES proposals(id),
  assigned_to   TEXT REFERENCES users(id),     -- NULL = any user with the required role can act
  due_at        TIMESTAMP,                     -- auto_escalate_days from created_at
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- AUDIT LOGS (append-only — no UPDATE or DELETE ever)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id            TEXT PRIMARY KEY,
  user_id       TEXT REFERENCES users(id),
  user_name     VARCHAR,                       -- denormalized: store name at time of action
  user_role     VARCHAR,                       -- denormalized: role at time of action
  action        VARCHAR NOT NULL,              -- CREATE | UPDATE | DELETE | LOGIN | etc.
  entity_type   VARCHAR NOT NULL,              -- proposal | borrower | user | etc.
  entity_id     TEXT,
  entity_label  VARCHAR,                       -- human-readable label
  field_name    VARCHAR,                       -- which field changed
  before_value  TEXT,                          -- value before change
  after_value   TEXT,                          -- value after change
  ip_address    VARCHAR,
  user_agent    TEXT,
  session_id    TEXT,
  request_id    TEXT,
  logged_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enforce immutability at database level (SQLite syntax - commented out for Postgres compatibility)
-- CREATE TRIGGER IF NOT EXISTS audit_logs_no_update
--   BEFORE UPDATE ON audit_logs
--   BEGIN
--     SELECT RAISE(ABORT, 'audit_logs records are immutable and cannot be updated');
--   END;

-- CREATE TRIGGER IF NOT EXISTS audit_logs_no_delete
--   BEFORE DELETE ON audit_logs
--   BEGIN
--     SELECT RAISE(ABORT, 'audit_logs records are immutable and cannot be deleted');
--   END;

-- ============================================================
-- SEED DATA
-- ============================================================

-- Departments
INSERT INTO departments (id, dept_code, dept_name, parent_id, level, is_active, created_at) VALUES
  ('dept-001', 'BRANCH',      'Branch Office',          NULL,       1, TRUE, CURRENT_TIMESTAMP),
  ('dept-002', 'REGIONAL',    'Regional Office',         NULL,       1, TRUE, CURRENT_TIMESTAMP),
  ('dept-003', 'CREDIT',      'Credit Department',       NULL,       1, TRUE, CURRENT_TIMESTAMP),
  ('dept-004', 'RISK',        'Risk Management',         NULL,       1, TRUE, CURRENT_TIMESTAMP),
  ('dept-005', 'COMPLIANCE',  'Compliance Department',   NULL,       1, TRUE, CURRENT_TIMESTAMP),
  ('dept-006', 'BOARD',       'Board of Directors',      NULL,       1, TRUE, CURRENT_TIMESTAMP),
  ('dept-007', 'IT',          'IT Department',           NULL,       1, TRUE, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Roles
INSERT INTO roles (id, role_code, role_name, dept_id, can_initiate, can_review, can_recommend, can_approve, can_override, is_admin, approval_limit_min, approval_limit_max, created_at) VALUES
  ('role-001', 'initiator',   'Credit Analyst (Maker)',        'dept-003', TRUE,  FALSE, FALSE, FALSE, FALSE, FALSE, 0,       NULL,        CURRENT_TIMESTAMP),
  ('role-002', 'reviewer',    'Credit Officer (Checker)',      'dept-003', FALSE, TRUE,  FALSE, FALSE, FALSE, FALSE, 0,       5000000,     CURRENT_TIMESTAMP),
  ('role-003', 'supporter',   'Branch Manager',                'dept-001', FALSE, TRUE,  TRUE,  FALSE, FALSE, FALSE, 0,       20000000,    CURRENT_TIMESTAMP),
  ('role-004', 'approver',    'Head Office Credit Manager',   'dept-003', FALSE, TRUE,  TRUE,  TRUE,  FALSE, FALSE, 0,       100000000,   CURRENT_TIMESTAMP),
  ('role-005', 'super_staff', 'Risk & Compliance Lead',        'dept-004', TRUE,  TRUE,  TRUE,  TRUE,  TRUE,  FALSE, 0,       NULL,        CURRENT_TIMESTAMP),
  ('role-008', 'admin',       'System Administrator',          'dept-007', FALSE, FALSE, FALSE, FALSE, FALSE, TRUE,  0,       NULL,        CURRENT_TIMESTAMP),
  ('role-009', 'super_admin', 'System Super Administrator',    'dept-007', TRUE,  TRUE,  TRUE,  TRUE,  TRUE,  TRUE,  0,       NULL,        CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Permissions
INSERT INTO permissions (id, permission_code, description, module) VALUES
  ('perm-001', 'PROPOSAL_CREATE',    'Create a new credit proposal',         'proposals'),
  ('perm-002', 'PROPOSAL_EDIT',      'Edit a draft proposal',                'proposals'),
  ('perm-003', 'PROPOSAL_SUBMIT',    'Submit proposal for approval',         'proposals'),
  ('perm-004', 'PROPOSAL_VIEW',      'View any proposal',                    'proposals'),
  ('perm-005', 'WORKFLOW_APPROVE',   'Approve at current workflow stage',    'workflow'),
  ('perm-006', 'WORKFLOW_RETURN',    'Return proposal to previous stage',    'workflow'),
  ('perm-007', 'WORKFLOW_ESCALATE',  'Escalate proposal to next stage',      'workflow'),
  ('perm-008', 'RISK_VIEW',          'View risk scoring details',            'risk'),
  ('perm-009', 'RISK_OVERRIDE',      'Override a risk grade',                'risk'),
  ('perm-010', 'BORROWER_CREATE',    'Create or edit borrower records',      'borrowers'),
  ('perm-011', 'REPORT_EXPORT',      'Export reports to CSV/Excel',          'reports'),
  ('perm-012', 'ADMIN_USERS',        'Manage users and role assignments',    'admin'),
  ('perm-013', 'ADMIN_CONFIG',       'Edit system configuration settings',   'admin'),
  ('perm-014', 'ADMIN_AUDIT_VIEW',   'View full audit log',                  'admin'),
  ('perm-015', 'WORKFLOW_QUERY',     'Send a query to the previous stage',   'workflow')
ON CONFLICT (id) DO NOTHING;

-- Role Permissions (Linking roles to granular permissions)
INSERT INTO role_permissions (role_id, permission_id) VALUES
  -- admin role permissions
  ('role-008', 'perm-012'), ('role-008', 'perm-013'), ('role-008', 'perm-014'), ('role-008', 'perm-011'),
  -- super_admin (all permissions)
  ('role-009', 'perm-001'), ('role-009', 'perm-002'), ('role-009', 'perm-003'), ('role-009', 'perm-004'),
  ('role-009', 'perm-005'), ('role-009', 'perm-006'), ('role-009', 'perm-007'), ('role-009', 'perm-008'),
  ('role-009', 'perm-009'), ('role-009', 'perm-010'), ('role-009', 'perm-011'), ('role-009', 'perm-012'),
  ('role-009', 'perm-013'), ('role-009', 'perm-014'), ('role-009', 'perm-015'),
  -- initiator
  ('role-001', 'perm-001'), ('role-001', 'perm-002'), ('role-001', 'perm-003'), ('role-001', 'perm-004'), ('role-001', 'perm-010'),
  -- reviewer
  ('role-002', 'perm-004'), ('role-002', 'perm-005'), ('role-002', 'perm-006'), ('role-002', 'perm-015'),
  -- approver
  ('role-004', 'perm-004'), ('role-004', 'perm-005'), ('role-004', 'perm-007'), ('role-004', 'perm-009')
ON CONFLICT DO NOTHING;

-- Users (Seeded from JSON files with bcrypt hashes)
INSERT INTO users (id, employee_code, full_name, email, password_hash, dept_id, status, created_at) VALUES
  ('101', 'admin',      'Admin User',  'admin@bank.com.np',      '$2b$10$p6wiwPZu/fiG4i3WAsmSU.Hns7.ylfrqWAa7fudV.A5HmCzqvr6yG', 'dept-007', 'active', CURRENT_TIMESTAMP),
  ('102', 'superadmin', 'Super Admin', 'superadmin@bank.com.np', '$2b$10$4RSr25L6dKKXko7pBQTW3etIqVwBuQ9GqEU7wxRmr5Pn.F9X2AvXO', 'dept-007', 'active', CURRENT_TIMESTAMP),
  ('1',   'TestUser',   'Test User',   'testuser@bank.com.np',   '$2b$10$You/KEU7G4ZDbB59X.faYOA67F2ShkPjakhUMUjMl5SfO80CmZPUm', 'dept-003', 'active', CURRENT_TIMESTAMP),
  ('2',   'TestUser1',  'Test User1',  'testuser1@bank.com.np',  '$2b$10$You/KEU7G4ZDbB59X.faYOA67F2ShkPjakhUMUjMl5SfO80CmZPUm', 'dept-003', 'active', CURRENT_TIMESTAMP),
  ('3',   'TestUser2',  'Test User2',  'testuser2@bank.com.np',  '$2b$10$You/KEU7G4ZDbB59X.faYOA67F2ShkPjakhUMUjMl5SfO80CmZPUm', 'dept-003', 'active', CURRENT_TIMESTAMP),
  ('4',   'TestUser3',  'Test User3',  'testuser3@bank.com.np',  '$2b$10$You/KEU7G4ZDbB59X.faYOA67F2ShkPjakhUMUjMl5SfO80CmZPUm', 'dept-003', 'active', CURRENT_TIMESTAMP),
  ('5',   'superstaff', 'Super Staff', 'superstaff@bank.com.np', '$2b$10$You/KEU7G4ZDbB59X.faYOA67F2ShkPjakhUMUjMl5SfO80CmZPUm', 'dept-003', 'active', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- User Roles Mapping
INSERT INTO user_roles (user_id, role_id, dept_id, assigned_by) VALUES
  ('101', 'role-008', 'dept-007', '101'), -- admin as admin
  ('102', 'role-009', 'dept-007', '101'), -- superadmin as super_admin
  ('1',   'role-001', 'dept-003', '101'), -- TestUser as initiator
  ('2',   'role-003', 'dept-001', '101'), -- TestUser1 as supporter (Branch Manager)
  ('3',   'role-002', 'dept-003', '101'), -- TestUser2 as reviewer
  ('4',   'role-004', 'dept-003', '101'), -- TestUser3 as approver
  ('5',   'role-005', 'dept-004', '101')  -- superstaff as super_staff
ON CONFLICT (user_id, role_id, dept_id) DO NOTHING;
