// CMS Portal — Shared TypeScript Type Definitions

export type UserRole = 'super_admin' | 'admin' | 'initiator' | 'supporter' | 'reviewer' | 'approver' | 'super_staff';
export type BorrowerType = 'individual' | 'proprietorship' | 'partnership' | 'private_limited' | 'public_limited' | 'cooperative' | 'ngo';
export type BorrowerStatus = 'active' | 'inactive' | 'blacklisted' | 'under_review';
export type FacilityType = 'term_loan' | 'working_capital' | 'overdraft' | 'letter_of_credit' | 'bank_guarantee' | 'hire_purchase' | 'mortgage_loan';
export type CollateralType = 'land_building' | 'vehicle' | 'fixed_deposit' | 'shares' | 'government_securities' | 'machinery' | 'inventory' | 'personal_guarantee';
export type ProposalStatus = 'draft' | 'submitted' | 'branch_review' | 'regional_review' | 'head_office_review' | 'board_review' | 'approved' | 'returned' | 'cancelled';
export type WorkflowActionType = 'submit' | 'forward' | 'approve' | 'return' | 'query' | 'escalate' | 'cancel';
export type RiskGrade = 'A' | 'B' | 'C' | 'D' | 'E';
export type RiskDecision = 'approve' | 'review' | 'decline';
export type NRBClassification = 'pass' | 'watch' | 'substandard' | 'doubtful' | 'loss';
export type KYCDocumentType = 'citizenship' | 'pan_certificate' | 'registration_certificate' | 'tax_clearance' | 'audited_financials' | 'bank_statement' | 'collateral_valuation' | 'insurance_policy' | 'other';
export type DocumentStatus = 'pending' | 'verified' | 'rejected' | 'expired';

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  is_active: boolean;
  mfa_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface SessionUser {
  id: number;
  username: string;
  email: string;
  full_name: string;
  roles: UserRole[];
  permissions: string[];
}

export interface Borrower {
  id: number;
  name: string;
  type: BorrowerType;
  pan_number: string;
  citizenship_number: string | null;
  registration_number: string | null;
  address: string;
  district: string;
  phone: string;
  email: string | null;
  sector: string;
  sub_sector: string | null;
  group_id: number | null;
  group_name: string | null;
  status: BorrowerStatus;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface KYCDocument {
  id: number;
  borrower_id: number;
  document_type: KYCDocumentType;
  file_name: string;
  file_path: string;
  status: DocumentStatus;
  verified_by: number | null;
  verified_at: string | null;
  expiry_date: string | null;
  remarks: string | null;
  uploaded_at: string;
}

export interface FinancialData {
  fiscal_year: string;
  revenue: number;
  gross_profit: number;
  net_profit: number;
  total_assets: number;
  total_liabilities: number;
  equity: number;
  operating_cash_flow: number;
  annual_debt_service: number;
  dscr: number;
  current_ratio: number;
  debt_to_equity: number;
}

export interface CollateralData {
  type: CollateralType;
  description: string;
  market_value: number;
  forced_sale_value: number;
  ltv_ratio: number;
  valuation_date: string;
  valuator: string;
  location: string;
  insurance_amount: number | null;
  insurance_expiry: string | null;
}

export interface Proposal {
  id: number;
  borrower_id: number;
  facility_id: number | null;
  proposal_number: string;
  proposal_type: string;
  amount: number;
  currency: string;
  purpose: string;
  financial_data: FinancialData | null;
  collateral_data: CollateralData | null;
  status: ProposalStatus;
  created_by: number;
  created_at: string;
  updated_at: string;
  borrower_name?: string;
  created_by_name?: string;
}

export interface HardStop {
  rule: string;
  triggered: boolean;
  actual_value: number;
  threshold: number;
  message: string;
}

export interface RiskScore {
  id: number;
  proposal_id: number;
  financial_score: number;
  business_score: number;
  management_score: number;
  collateral_score: number;
  industry_score: number;
  weighted_total: number;
  risk_grade: RiskGrade;
  dscr: number;
  ltv: number;
  group_exposure_pct: number;
  hard_stops: HardStop[];
  decision: RiskDecision;
  scored_by: number;
  scored_at: string;
}

export interface WorkflowInstance {
  id: number;
  proposal_id: number;
  current_stage: ProposalStatus;
  previous_stage: ProposalStatus | null;
  assigned_to: number | null;
  assigned_to_name?: string;
  escalated: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkflowActionRecord {
  id: number;
  workflow_id: number;
  from_stage: ProposalStatus;
  to_stage: ProposalStatus;
  action_type: WorkflowActionType;
  actor_id: number;
  actor_name?: string;
  remarks: string;
  created_at: string;
}

export interface AuditLog {
  id: number;
  entity_type: string;
  entity_id: number;
  action: string;
  before_value: Record<string, unknown> | null;
  after_value: Record<string, unknown> | null;
  actor_id: number;
  actor_name?: string;
  ip_address: string | null;
  created_at: string;
}

export interface Setting {
  id: number;
  key: string;
  value: string;
  category: string;
  label: string;
  description: string | null;
  updated_by: number | null;
  updated_at: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ActionState {
  success?: boolean;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface DashboardKPIs {
  totalExposure: number;
  activeProposals: number;
  pendingApprovals: number;
  overdueAccounts: number;
  approvalRate: number;
  avgTurnaroundDays: number;
}

export interface RiskDistribution {
  grade: RiskGrade;
  count: number;
  amount: number;
}

export interface WorkflowFunnel {
  stage: ProposalStatus;
  label: string;
  count: number;
}

export const NEPAL_SECTORS = [
  'Agriculture & Forestry', 'Manufacturing', 'Construction', 'Trade & Commerce',
  'Transportation', 'Hotels & Tourism', 'Finance & Insurance', 'Real Estate',
  'Education', 'Health Services', 'Information Technology', 'Energy & Power',
  'Mining & Quarrying', 'Other Services',
] as const;

export type NepalSector = typeof NEPAL_SECTORS[number];

export const PERMISSIONS = {
  BORROWER_VIEW: 'borrower:view', BORROWER_CREATE: 'borrower:create',
  BORROWER_EDIT: 'borrower:edit', BORROWER_DELETE: 'borrower:delete',
  PROPOSAL_VIEW: 'proposal:view', PROPOSAL_CREATE: 'proposal:create',
  PROPOSAL_EDIT: 'proposal:edit',
  WORKFLOW_SUBMIT: 'workflow:submit', WORKFLOW_APPROVE: 'workflow:approve',
  WORKFLOW_RETURN: 'workflow:return',
  RISK_VIEW: 'risk:view', RISK_OVERRIDE: 'risk:override',
  USER_MANAGE: 'admin:users', SETTINGS_MANAGE: 'admin:settings',
  REPORTS_VIEW: 'reports:view', REPORTS_EXPORT: 'reports:export',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
