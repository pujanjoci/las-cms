import { z } from 'zod';

// ── Auth ──────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  username: z.string().min(2, 'Username is required'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
});

export const createUserSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9._]+$/, 'Only letters, numbers, dots, and underscores'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Minimum 8 characters').regex(/[A-Z]/, 'Need one uppercase').regex(/[0-9]/, 'Need one number'),
  full_name: z.string().min(2).max(100),
  branch: z.string().optional(),
  designation: z.string().optional(),
  roles: z.array(z.string()).min(1, 'At least one role required'),
});

// ── Borrower ──────────────────────────────────────────────────────────────────

export const borrowerSchema = z.object({
  name: z.string().min(2, 'Name is required').max(200),
  type: z.enum(['individual', 'proprietorship', 'partnership', 'private_limited', 'public_limited', 'cooperative', 'ngo']),
  pan_number: z.string().regex(/^\d{9}$/, 'PAN must be exactly 9 digits'),
  citizenship_number: z.string().regex(/^\d{2}-\d{2}-\d{2}-\d{5}$/, 'Format: XX-XX-XX-XXXXX').optional().or(z.literal('')),
  registration_number: z.string().optional().or(z.literal('')),
  address: z.string().min(5, 'Address is required'),
  district: z.string().min(2, 'District is required'),
  phone: z.string().regex(/^(98|97|96)\d{8}$/, 'Valid 10-digit Nepali mobile number'),
  email: z.string().email().optional().or(z.literal('')),
  sector: z.string().min(1, 'Sector is required'),
  sub_sector: z.string().optional().or(z.literal('')),
  group_id: z.number().optional().nullable(),
  group_name: z.string().optional().or(z.literal('')),
  annual_turnover: z.number().min(0).optional(),
  years_in_business: z.number().int().min(0).optional(),
  number_of_employees: z.number().int().min(0).optional(),
});

// ── Financial Data ────────────────────────────────────────────────────────────

export const financialDataSchema = z.object({
  fiscal_year: z.string().min(4),
  revenue: z.number().min(0),
  gross_profit: z.number(),
  net_profit: z.number(),
  total_assets: z.number().min(0),
  total_liabilities: z.number().min(0),
  equity: z.number(),
  operating_cash_flow: z.number(),
  annual_debt_service: z.number().min(0),
  dscr: z.number(),
  current_ratio: z.number(),
  debt_to_equity: z.number(),
});

// ── Collateral Data ───────────────────────────────────────────────────────────

export const collateralDataSchema = z.object({
  type: z.enum(['land_building', 'vehicle', 'fixed_deposit', 'shares', 'government_securities', 'machinery', 'inventory', 'personal_guarantee']),
  description: z.string().min(5),
  market_value: z.number().positive(),
  forced_sale_value: z.number().positive(),
  ltv_ratio: z.number().min(0).max(100),
  valuation_date: z.string(),
  valuator: z.string().min(2),
  location: z.string().min(3),
  insurance_amount: z.number().nullable().optional(),
  insurance_expiry: z.string().nullable().optional(),
});

// ── Proposal ──────────────────────────────────────────────────────────────────

export const proposalSchema = z.object({
  borrower_id: z.number().int().positive(),
  facility_id: z.number().int().positive().nullable().optional(),
  proposal_type: z.enum(['fresh', 'renewal', 'enhancement', 'review', 'restructuring']),
  amount: z.number().positive('Amount must be positive'),
  currency: z.enum(['NPR', 'USD', 'INR']).default('NPR'),
  purpose: z.string().min(10, 'Purpose must be at least 10 characters'),
  priority: z.enum(['normal', 'urgent', 'high']).default('normal'),
  target_close_date: z.string().optional(),
});

// ── Facility ──────────────────────────────────────────────────────────────────

export const facilitySchema = z.object({
  borrower_id: z.number().int().positive(),
  facility_type: z.enum(['term_loan', 'working_capital', 'overdraft', 'letter_of_credit', 'bank_guarantee', 'hire_purchase', 'mortgage_loan']),
  amount: z.number().positive(),
  currency: z.enum(['NPR', 'USD', 'INR']).default('NPR'),
  tenor_months: z.number().int().positive(),
  interest_rate: z.number().min(0).max(36),
  purpose: z.string().min(5),
  collateral_type: z.enum(['land_building', 'vehicle', 'fixed_deposit', 'shares', 'government_securities', 'machinery', 'inventory', 'personal_guarantee']),
  collateral_value: z.number().positive(),
  ltv_ratio: z.number().min(0).max(100),
});

// ── Workflow ──────────────────────────────────────────────────────────────────

export const workflowActionSchema = z.object({
  workflow_id: z.number().int().positive(),
  action_type: z.enum(['submit', 'forward', 'approve', 'return', 'query', 'escalate', 'cancel']),
  remarks: z.string().min(3, 'Remarks are required for workflow actions'),
});

// ── Settings ──────────────────────────────────────────────────────────────────

export const settingSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
  category: z.string().min(1),
  label: z.string().min(1),
  description: z.string().optional(),
});
