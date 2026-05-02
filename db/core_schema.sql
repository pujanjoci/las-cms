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

-- Enforce immutability at database level
CREATE TRIGGER IF NOT EXISTS audit_logs_no_update
  BEFORE UPDATE ON audit_logs
  BEGIN
    SELECT RAISE(ABORT, 'audit_logs records are immutable and cannot be updated');
  END;

CREATE TRIGGER IF NOT EXISTS audit_logs_no_delete
  BEFORE DELETE ON audit_logs
  BEGIN
    SELECT RAISE(ABORT, 'audit_logs records are immutable and cannot be deleted');
  END;

-- ============================================================
-- SEED DATA
-- ============================================================

-- Departments
INSERT OR IGNORE INTO departments (id, dept_code, dept_name, parent_id, level, is_active, created_at) VALUES
  ('dept-001', 'BRANCH',      'Branch Office',          NULL,       1, TRUE, CURRENT_TIMESTAMP),
  ('dept-002', 'REGIONAL',    'Regional Office',         NULL,       1, TRUE, CURRENT_TIMESTAMP),
  ('dept-003', 'CREDIT',      'Credit Department',       NULL,       1, TRUE, CURRENT_TIMESTAMP),
  ('dept-004', 'RISK',        'Risk Management',         NULL,       1, TRUE, CURRENT_TIMESTAMP),
  ('dept-005', 'COMPLIANCE',  'Compliance Department',   NULL,       1, TRUE, CURRENT_TIMESTAMP),
  ('dept-006', 'BOARD',       'Board of Directors',      NULL,       1, TRUE, CURRENT_TIMESTAMP),
  ('dept-007', 'IT',          'IT Department',           NULL,       1, TRUE, CURRENT_TIMESTAMP);

-- Roles
INSERT OR IGNORE INTO roles (id, role_code, role_name, dept_id, can_initiate, can_review, can_recommend, can_approve, can_override, is_admin, approval_limit_min, approval_limit_max, created_at) VALUES
  ('role-001', 'MAKER',        'Credit Analyst (Maker)',        'dept-003', TRUE,  FALSE, FALSE, FALSE, FALSE, FALSE, 0,       NULL,        CURRENT_TIMESTAMP),
  ('role-002', 'CHECKER',      'Credit Officer (Checker)',      'dept-003', FALSE, TRUE,  FALSE, FALSE, FALSE, FALSE, 0,       5000000,     CURRENT_TIMESTAMP),
  ('role-003', 'RECOMMENDER',  'Branch Manager',                'dept-001', FALSE, TRUE,  TRUE,  FALSE, FALSE, FALSE, 0,       20000000,    CURRENT_TIMESTAMP),
  ('role-004', 'HO_APPROVER',  'Head Office Credit Manager',   'dept-003', FALSE, TRUE,  TRUE,  TRUE,  FALSE, FALSE, 0,       100000000,   CURRENT_TIMESTAMP),
  ('role-005', 'RISK_ANALYST', 'Risk Analyst',                  'dept-004', FALSE, TRUE,  FALSE, FALSE, FALSE, FALSE, 0,       NULL,        CURRENT_TIMESTAMP),
  ('role-006', 'RISK_OVERRIDE','Risk Override Officer',         'dept-004', FALSE, FALSE, FALSE, FALSE, TRUE,  FALSE, 0,       NULL,        CURRENT_TIMESTAMP),
  ('role-007', 'BOARD_MEMBER', 'Board Member',                  'dept-006', FALSE, FALSE, FALSE, TRUE,  FALSE, FALSE, 100000001, NULL,      CURRENT_TIMESTAMP),
  ('role-008', 'ADMIN',        'System Administrator',          'dept-007', FALSE, FALSE, FALSE, FALSE, FALSE, TRUE,  0,       NULL,        CURRENT_TIMESTAMP);

-- Permissions
INSERT OR IGNORE INTO permissions (id, permission_code, description, module) VALUES
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
  ('perm-015', 'WORKFLOW_QUERY',     'Send a query to the previous stage',   'workflow');
