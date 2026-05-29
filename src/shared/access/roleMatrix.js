/**
 * Role & use-case permissions aligned with `Use Case & Role Permissions Matrix.md`.
 * Server-side enforcement is still required; this drives UX (hide/disable actions).
 */

export const ROLE = {
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  SALES_MANAGER: 'SALES_MANAGER',
  SALES_AGENT: 'SALES_AGENT',
};

/** @param {{ id?: number|string, roleName?: string } | null | undefined} user */
function userId(user) {
  return user?.id != null ? user.id : null;
}

/**
 * CRM-L03: Sales Agent may view lead detail only if creator or current assignee.
 * @param {Record<string, unknown>} lead
 * @param {{ id?: number|string, roleName?: string } | null | undefined} user
 */
export function canSalesAgentViewLead(lead, user) {
  if (!lead || !user || user.roleName !== ROLE.SALES_AGENT) return true;
  const uid = userId(user);
  if (uid == null) return false;
  const creator = lead.addedBy ?? lead.createdBy;
  const assignee = lead.assignedTo;
  return creator === uid || assignee === uid;
}

/**
 * CRM-L04 / CRM-L09: Sales Agent may update or delete only when they "own" the lead
 * (creator or assignee — same as operational ownership for this workflow).
 */
export function canSalesAgentMutateLead(lead, user) {
  if (!lead || !user || user.roleName !== ROLE.SALES_AGENT) return false;
  const uid = userId(user);
  if (uid == null) return false;
  const creator = lead.addedBy ?? lead.createdBy;
  const assignee = lead.assignedTo;
  return creator === uid || assignee === uid;
}

/**
 * CRM-L04: Lead update — admin/manager always; agent only if mutate allowed.
 */
export function canEditLead(lead, user) {
  if (!user) return false;
  if (user.roleName === ROLE.SYSTEM_ADMIN || user.roleName === ROLE.SALES_MANAGER) return true;
  if (user.roleName === ROLE.SALES_AGENT) return canSalesAgentMutateLead(lead, user);
  return false;
}

/**
 * CRM-L09: Lead deletion — admin/manager always; agent only if owner (mutate) allowed.
 */
export function canDeleteLead(lead, user) {
  if (!user) return false;
  if (user.roleName === ROLE.SYSTEM_ADMIN || user.roleName === ROLE.SALES_MANAGER) return true;
  if (user.roleName === ROLE.SALES_AGENT) return canSalesAgentMutateLead(lead, user);
  return false;
}

/** CRM-L05: Approve / deny — System Administrator, Sales Manager */
export function canValidateLead(user) {
  return user?.roleName === ROLE.SYSTEM_ADMIN || user?.roleName === ROLE.SALES_MANAGER;
}

/** CRM-L07: Assign to agent — System Administrator, Sales Manager */
export function canAssignLead(user) {
  return user?.roleName === ROLE.SYSTEM_ADMIN || user?.roleName === ROLE.SALES_MANAGER;
}

/** DLR-01 / DLR-02: Dealer creation from lead — not Sales Agent */
export function canConvertLeadToDealer(user) {
  return user?.roleName === ROLE.SYSTEM_ADMIN || user?.roleName === ROLE.SALES_MANAGER;
}

/** SUB-P01: Plan create/update/delete — System Administrator only */
export function canManageSubscriptionPlans(user) {
  return user?.roleName === ROLE.SYSTEM_ADMIN;
}

/** SUB-P01 view + SUB-P02 / SUB-P03 listing — Admin + Sales Manager (+ agents for active plans API elsewhere) */
export function canViewSubscriptionPlansPage(user) {
  return (
    user?.roleName === ROLE.SYSTEM_ADMIN ||
    user?.roleName === ROLE.SALES_MANAGER ||
    user?.roleName === ROLE.SALES_AGENT
  );
}

/** AC-03: User management page — admin + manager (manager limited in UI) */
export function canAccessUsersManagement(user) {
  return user?.roleName === ROLE.SYSTEM_ADMIN || user?.roleName === ROLE.SALES_MANAGER;
}

/** AC-03: Delete / update users — System Administrator only */
export function canDeleteOrUpdateUsers(user) {
  return user?.roleName === ROLE.SYSTEM_ADMIN;
}

/** AC-03: Create user — admin (any role in UI) or manager (Sales Agents only in UI) */
export function canCreateUser(user) {
  return user?.roleName === ROLE.SYSTEM_ADMIN || user?.roleName === ROLE.SALES_MANAGER;
}

/** Manager may only create Sales Agents (matrix) */
export function isSalesManagerLimitedToAgentCreation(user) {
  return user?.roleName === ROLE.SALES_MANAGER;
}

/** WMS-01: Provision warehouse — System Administrator only */
export function canProvisionWarehouse(user) {
  return user?.roleName === ROLE.SYSTEM_ADMIN;
}
