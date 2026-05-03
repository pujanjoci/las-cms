'use client';

import type { ProposalStatus, RiskGrade, DocumentStatus, BorrowerStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: ProposalStatus | DocumentStatus | BorrowerStatus | string;
  size?: 'sm' | 'md';
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  draft:               { label: 'Draft',           className: 'status-draft' },
  submitted:           { label: 'Submitted',       className: 'status-review' },
  branch_review:       { label: 'Branch Review',   className: 'status-review' },
  regional_review:     { label: 'Regional Review', className: 'status-review' },
  head_office_review:  { label: 'HO Review',       className: 'status-review' },
  board_review:        { label: 'Board Review',     className: 'status-review' },
  approved:            { label: 'Approved',         className: 'status-approved' },
  returned:            { label: 'Returned',         className: 'status-rejected' },
  cancelled:           { label: 'Cancelled',        className: 'status-cancelled' },
  pending:             { label: 'Pending',          className: 'status-pending' },
  verified:            { label: 'Verified',         className: 'status-approved' },
  rejected:            { label: 'Rejected',         className: 'status-rejected' },
  expired:             { label: 'Expired',          className: 'status-cancelled' },
  active:              { label: 'Active',           className: 'status-approved' },
  inactive:            { label: 'Inactive',         className: 'status-draft' },
  blacklisted:         { label: 'Blacklisted',      className: 'status-rejected' },
  under_review:        { label: 'Under Review',     className: 'status-pending' },
};

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = STATUS_MAP[status] || { label: status, className: 'status-draft' };
  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-[11px] px-3 py-1';

  return (
    <span className={`status-badge ${sizeClass} ${config.className}`}>
      {config.label}
    </span>
  );
}

// ── Risk Grade Pill ───────────────────────────────────────────────────────────

interface RiskPillProps {
  grade: RiskGrade | string;
  showLabel?: boolean;
}

const GRADE_MAP: Record<string, { label: string; className: string }> = {
  A: { label: 'Low Risk',       className: 'grade-a' },
  B: { label: 'Moderate',       className: 'grade-b' },
  C: { label: 'Medium Risk',    className: 'grade-c' },
  D: { label: 'High Risk',      className: 'grade-d' },
  E: { label: 'Very High Risk', className: 'grade-e' },
};

export function RiskPill({ grade, showLabel = false }: RiskPillProps) {
  const config = GRADE_MAP[grade] || { label: 'N/A', className: 'grade-c' };

  return (
    <span className={`grade-badge inline-flex items-center gap-1.5 uppercase tracking-wider ${config.className}`}>
      <span>Grade {grade}</span>
      {showLabel && <span className="font-medium opacity-80 italic">· {config.label}</span>}
    </span>
  );
}
