import type { SessionUser, UserRole, Permission } from './types';
import { PERMISSIONS } from './types';
export { PERMISSIONS };

// ── Role → Permission mapping ─────────────────────────────────────────────────

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: Object.values(PERMISSIONS),
  admin: [
    PERMISSIONS.USER_MANAGE, PERMISSIONS.SETTINGS_MANAGE,
    PERMISSIONS.REPORTS_VIEW, PERMISSIONS.REPORTS_EXPORT,
  ],
  super_staff: [
    PERMISSIONS.BORROWER_VIEW, PERMISSIONS.BORROWER_CREATE, PERMISSIONS.BORROWER_EDIT, PERMISSIONS.BORROWER_DELETE,
    PERMISSIONS.PROPOSAL_VIEW, PERMISSIONS.PROPOSAL_CREATE, PERMISSIONS.PROPOSAL_EDIT,
    PERMISSIONS.WORKFLOW_SUBMIT, PERMISSIONS.WORKFLOW_APPROVE, PERMISSIONS.WORKFLOW_RETURN,
    PERMISSIONS.RISK_VIEW, PERMISSIONS.RISK_OVERRIDE,
    PERMISSIONS.REPORTS_VIEW, PERMISSIONS.REPORTS_EXPORT,
  ],
  initiator: [
    PERMISSIONS.BORROWER_VIEW, PERMISSIONS.BORROWER_CREATE, PERMISSIONS.BORROWER_EDIT,
    PERMISSIONS.PROPOSAL_VIEW, PERMISSIONS.PROPOSAL_CREATE, PERMISSIONS.PROPOSAL_EDIT,
    PERMISSIONS.WORKFLOW_SUBMIT,
    PERMISSIONS.RISK_VIEW,
    PERMISSIONS.REPORTS_VIEW,
  ],
  supporter: [
    PERMISSIONS.BORROWER_VIEW,
    PERMISSIONS.PROPOSAL_VIEW, PERMISSIONS.PROPOSAL_CREATE,
    PERMISSIONS.WORKFLOW_SUBMIT,
    PERMISSIONS.RISK_VIEW,
    PERMISSIONS.REPORTS_VIEW,
  ],
  reviewer: [
    PERMISSIONS.BORROWER_VIEW,
    PERMISSIONS.PROPOSAL_VIEW, PERMISSIONS.PROPOSAL_CREATE,
    PERMISSIONS.WORKFLOW_SUBMIT, PERMISSIONS.WORKFLOW_RETURN, PERMISSIONS.WORKFLOW_APPROVE,
    PERMISSIONS.RISK_VIEW,
    PERMISSIONS.REPORTS_VIEW,
  ],
  approver: [
    PERMISSIONS.BORROWER_VIEW,
    PERMISSIONS.PROPOSAL_VIEW, PERMISSIONS.PROPOSAL_CREATE,
    PERMISSIONS.WORKFLOW_APPROVE, PERMISSIONS.WORKFLOW_RETURN,
    PERMISSIONS.RISK_VIEW, PERMISSIONS.RISK_OVERRIDE,
    PERMISSIONS.REPORTS_VIEW,
  ],
};

// ── Permission checks ─────────────────────────────────────────────────────────

export function hasPermission(user: SessionUser, permission: Permission): boolean {
  if (user.roles.includes('admin')) return true;
  return user.permissions.includes(permission) ||
    user.roles.some((role) => ROLE_PERMISSIONS[role]?.includes(permission));
}

export function hasRole(user: SessionUser, ...roles: UserRole[]): boolean {
  return roles.some((role) => user.roles.includes(role));
}

export function requirePermission(user: SessionUser, permission: Permission): void {
  if (!hasPermission(user, permission)) {
    throw new Error(`Forbidden: requires ${permission}`);
  }
}

export function requireRole(user: SessionUser, ...roles: UserRole[]): void {
  if (!hasRole(user, ...roles)) {
    throw new Error(`Forbidden: requires role ${roles.join(' or ')}`);
  }
}

/** Get all permissions for a role */
export function getPermissionsForRole(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/** Get the JSON permissions array to store in the roles table */
export function getPermissionsJson(role: UserRole): string {
  return JSON.stringify(getPermissionsForRole(role));
}
