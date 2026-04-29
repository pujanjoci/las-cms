-- ─────────────────────────────────────────────────────────────────────────────
-- CMS Portal — Supabase SQL Seed Script
-- Run this script in the Supabase SQL Editor to insert the default users and roles.
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable pgcrypto for securely hashing passwords within SQL
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Insert Default Roles
INSERT INTO roles (name, description, permissions) VALUES
(
  'super_admin', 
  'SUPER ADMIN', 
  '["borrower:view","borrower:create","borrower:edit","borrower:delete","proposal:view","proposal:create","proposal:edit","workflow:submit","workflow:approve","workflow:return","risk:view","risk:override","admin:users","admin:settings","reports:view","reports:export"]'::jsonb
),
(
  'admin', 
  'ADMIN', 
  '["admin:users","admin:settings","reports:view","reports:export"]'::jsonb
),
(
  'super_staff', 
  'SUPER STAFF', 
  '["borrower:view","borrower:create","borrower:edit","borrower:delete","proposal:view","proposal:create","proposal:edit","workflow:submit","workflow:approve","workflow:return","risk:view","risk:override","reports:view","reports:export"]'::jsonb
),
(
  'initiator', 
  'INITIATOR', 
  '["borrower:view","borrower:create","borrower:edit","proposal:view","proposal:create","proposal:edit","workflow:submit","risk:view"]'::jsonb
),
(
  'supporter', 
  'SUPPORTER', 
  '["borrower:view","proposal:view","workflow:submit","risk:view"]'::jsonb
),
(
  'reviewer', 
  'REVIEWER', 
  '["borrower:view","proposal:view","workflow:submit","workflow:return","risk:view"]'::jsonb
),
(
  'approver', 
  'APPROVER', 
  '["borrower:view","proposal:view","workflow:approve","workflow:return","risk:view","risk:override"]'::jsonb
)
ON CONFLICT (name) DO UPDATE SET permissions = EXCLUDED.permissions;

-- 2. Insert Users from admins.json and users.json
INSERT INTO users (username, email, password_hash, full_name, branch, designation) VALUES
(
  'admin', 
  'admin@bank.com.np', 
  crypt('Admin@123', gen_salt('bf', 10)), 
  'Admin User', 
  'Head Office', 
  'ADMIN'
),
(
  'superadmin', 
  'superadmin@bank.com.np', 
  crypt('SuperAdmin@123', gen_salt('bf', 10)), 
  'Super Admin', 
  'Head Office', 
  'SUPER ADMIN'
),
(
  'TestUser', 
  'testuser@bank.com.np', 
  crypt('test123', gen_salt('bf', 10)), 
  'Test User', 
  'Head Office', 
  'INITIATOR'
),
(
  'TestUser1', 
  'testuser1@bank.com.np', 
  crypt('test123', gen_salt('bf', 10)), 
  'Test User1', 
  'Kathmandu', 
  'SUPPORTER'
),
(
  'TestUser2', 
  'testuser2@bank.com.np', 
  crypt('test123', gen_salt('bf', 10)), 
  'Test User2', 
  'Head Office', 
  'REVIEWER'
),
(
  'TestUser3', 
  'testuser3@bank.com.np', 
  crypt('test123', gen_salt('bf', 10)), 
  'Test User3', 
  'Head Office', 
  'APPROVER'
),
(
  'superstaff', 
  'superstaff@bank.com.np', 
  crypt('test123', gen_salt('bf', 10)), 
  'Super Staff', 
  'Head Office', 
  'SUPER STAFF'
)
ON CONFLICT (username) DO NOTHING;

-- 3. Map Users to Roles
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'admin' AND r.name = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'superadmin' AND r.name = 'super_admin'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'TestUser' AND r.name = 'initiator'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'TestUser1' AND r.name = 'supporter'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'TestUser2' AND r.name = 'reviewer'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'TestUser3' AND r.name = 'approver'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'superstaff' AND r.name = 'super_staff'
ON CONFLICT DO NOTHING;

