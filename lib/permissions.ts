import { useEffect, useState, useMemo, useCallback } from "react";
import {
  db,
  type User,
  type UserRole,
  type ModuleKey,
  type PermissionAction,
  type OverrideState,
  type RolePermissionTemplate,
  type UserPermissionOverride,
  type AuditLogRecord,
} from "./db";
import { useAuthStore } from "@/store/authStore";

export type { ModuleKey, PermissionAction, OverrideState };

export const ALL_PERMISSION_ACTIONS: PermissionAction[] = [
  "view",
  "create",
  "edit",
  "archive",
  "delete",
  "approve",
  "send",
  "voidCredit",
];

export const ACTION_LABELS: Record<PermissionAction, string> = {
  view: "View",
  create: "Create",
  edit: "Edit",
  archive: "Archive",
  delete: "Delete",
  approve: "Approve",
  send: "Send",
  voidCredit: "Void/Credit",
};

export interface ModuleDefinition {
  key: ModuleKey;
  label: string;
  category: "Databases" | "Commercial" | "Field & Execution" | "Build Management" | "Financial" | "Administration";
  description: string;
  route?: string;
  supportedActions: PermissionAction[];
}

export const MODULE_DEFINITIONS: ModuleDefinition[] = [
  // Databases
  {
    key: "customers",
    label: "Customers",
    category: "Databases",
    description: "Client directory, accounts, and contact profiles",
    route: "/customers",
    supportedActions: ["view", "create", "edit", "archive", "delete"],
  },
  {
    key: "sites",
    label: "Sites",
    category: "Databases",
    description: "Construction sites, locations, and active site management",
    route: "/sites",
    supportedActions: ["view", "create", "edit", "archive", "delete"],
  },
  {
    key: "suppliers",
    label: "Suppliers & Contractors",
    category: "Databases",
    description: "Trade contractors, vendors, and supplier database",
    route: "/contractors",
    supportedActions: ["view", "create", "edit", "archive", "delete"],
  },
  {
    key: "crew",
    label: "My People (Crew)",
    category: "Databases",
    description: "Internal field workers, operatives, and team directory",
    route: "/crew",
    supportedActions: ["view", "create", "edit", "archive", "delete"],
  },

  // Commercial
  {
    key: "leads",
    label: "Leads & Pipeline",
    category: "Commercial",
    description: "Enquiries, sales pipeline, and client conversion",
    route: "/pipeline",
    supportedActions: ["view", "create", "edit", "archive", "delete"],
  },
  {
    key: "quotes",
    label: "Quotations",
    category: "Commercial",
    description: "Estimates, costings, client proposals, and send quotes",
    route: "/quotations",
    supportedActions: ["view", "create", "edit", "archive", "delete", "approve", "send"],
  },
  {
    key: "tenders",
    label: "Tendering",
    category: "Commercial",
    description: "Trade packages, RFQ submissions, and contractor awards",
    route: "/tenders",
    supportedActions: ["view", "create", "edit", "archive", "delete", "approve", "send"],
  },

  // Field & Execution
  {
    key: "projects",
    label: "Projects",
    category: "Field & Execution",
    description: "Contract projects, project leads, and project milestones",
    route: "/projects",
    supportedActions: ["view", "create", "edit", "archive", "delete"],
  },
  {
    key: "jobs",
    label: "Jobs & Work Orders",
    category: "Field & Execution",
    description: "Job packages, site assignments, trade work orders",
    route: "/jobs",
    supportedActions: ["view", "create", "edit", "archive", "delete", "approve"],
  },
  {
    key: "scheduling",
    label: "Scheduling & Dispatch",
    category: "Field & Execution",
    description: "Gantt calendar, worker dispatch, timeline scheduling",
    route: "/scheduling",
    supportedActions: ["view", "create", "edit", "archive", "delete", "approve"],
  },
  {
    key: "timesheets",
    label: "Timesheets",
    category: "Field & Execution",
    description: "Worker hours logged, shift records, and manager approvals",
    route: "/timesheets",
    supportedActions: ["view", "create", "edit", "archive", "delete", "approve"],
  },
  {
    key: "variations",
    label: "Variations",
    category: "Field & Execution",
    description: "Scope changes, extra works, and commercial approvals",
    route: "/variations",
    supportedActions: ["view", "create", "edit", "archive", "delete", "approve"],
  },
  {
    key: "rfis",
    label: "RFIs (Requests for Information)",
    category: "Field & Execution",
    description: "Design queries, technical clarifications, and formal responses",
    route: "/rfis",
    supportedActions: ["view", "create", "edit", "archive", "delete", "approve", "send"],
  },

  // Build Management
  {
    key: "documents",
    label: "Documents & Drawings",
    category: "Build Management",
    description: "Drawings, architectural plans, specifications, and files",
    route: "/documents",
    supportedActions: ["view", "create", "edit", "archive", "delete"],
  },
  {
    key: "safety",
    label: "Safety & Incidents",
    category: "Build Management",
    description: "WHS incident logs, PPE compliance, and safety audits",
    route: "/safety",
    supportedActions: ["view", "create", "edit", "archive", "delete", "approve"],
  },
  {
    key: "punchLists",
    label: "Punch Lists & Snagging",
    category: "Build Management",
    description: "Defect rectification, site snagging, and sign-offs",
    route: "/punch-lists",
    supportedActions: ["view", "create", "edit", "archive", "delete", "approve"],
  },

  // Financial
  {
    key: "financial",
    label: "Financial & Invoicing",
    category: "Financial",
    description: "Invoices, Purchase Orders, Supplier Bills, and Job Budgets",
    route: "/finance",
    supportedActions: ["view", "create", "edit", "archive", "delete", "approve", "send", "voidCredit"],
  },
  {
    key: "reports",
    label: "Reports & Analytics",
    category: "Financial",
    description: "Executive summaries, revenue margins, and site reports",
    route: "/reports",
    supportedActions: ["view"],
  },

  // Administration
  {
    key: "userManagement",
    label: "User & Access Management",
    category: "Administration",
    description: "Employee provisioning, roles, and permission matrix",
    route: "/users",
    supportedActions: ["view", "create", "edit", "archive", "delete"],
  },
  {
    key: "auditLog",
    label: "Audit Log",
    category: "Administration",
    description: "Audit trail of security, permissions, and administrative changes",
    route: "/setting?tab=audit-log",
    supportedActions: ["view"],
  },
];

export type ModulePermissions = Record<PermissionAction, boolean>;
export type FullEffectivePermissions = Record<ModuleKey, ModulePermissions>;
export type UserModuleOverrides = Record<ModuleKey, Partial<Record<PermissionAction, OverrideState>>>;

/**
 * Creates an empty permission record where all actions are false.
 */
export const createEmptyModulePermissions = (): ModulePermissions => ({
  view: false,
  create: false,
  edit: false,
  archive: false,
  delete: false,
  approve: false,
  send: false,
  voidCredit: false,
});

/**
 * Creates an all-true permission record.
 */
export const createFullModulePermissions = (): ModulePermissions => ({
  view: true,
  create: true,
  edit: true,
  archive: true,
  delete: true,
  approve: true,
  send: true,
  voidCredit: true,
});

/**
 * SOURCE OF TRUTH: FIRMA Solution Requirements PDF (Pages 17-21)
 * Default permission templates for each of the 7 roles across all modules.
 */
export const ROLE_DEFAULT_TEMPLATES: Record<UserRole, FullEffectivePermissions> = {
  OWNER: (() => {
    const full: Partial<FullEffectivePermissions> = {};
    MODULE_DEFINITIONS.forEach((m) => {
      full[m.key] = createFullModulePermissions();
    });
    return full as FullEffectivePermissions;
  })(),

  ACCOUNT_ADMIN: (() => {
    const full: Partial<FullEffectivePermissions> = {};
    MODULE_DEFINITIONS.forEach((m) => {
      full[m.key] = createFullModulePermissions();
    });
    return full as FullEffectivePermissions;
  })(),

  SALES_MANAGER: {
    customers: { view: true, create: true, edit: true, archive: true, delete: false, approve: false, send: false, voidCredit: false },
    sites: { view: true, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    suppliers: { view: true, create: true, edit: true, archive: true, delete: false, approve: false, send: false, voidCredit: false },
    crew: { view: true, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    leads: { view: true, create: true, edit: true, archive: true, delete: true, approve: false, send: false, voidCredit: false },
    quotes: { view: true, create: true, edit: true, archive: true, delete: false, approve: true, send: true, voidCredit: false },
    tenders: { view: true, create: true, edit: true, archive: true, delete: false, approve: true, send: true, voidCredit: false },
    projects: { view: true, create: true, edit: true, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    jobs: { view: true, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    scheduling: { view: true, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    timesheets: { view: false, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    variations: { view: true, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    rfis: { view: true, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    documents: { view: true, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    safety: { view: false, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    punchLists: { view: false, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    financial: { view: true, create: true, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    reports: { view: true, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    userManagement: { view: false, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    auditLog: { view: false, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
  },

  PROJECT_MANAGER: {
    customers: { view: true, create: true, edit: true, archive: true, delete: false, approve: false, send: false, voidCredit: false },
    sites: { view: true, create: true, edit: true, archive: true, delete: false, approve: false, send: false, voidCredit: false },
    suppliers: { view: true, create: true, edit: true, archive: true, delete: false, approve: false, send: false, voidCredit: false },
    crew: { view: true, create: true, edit: true, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    leads: { view: false, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    quotes: { view: true, create: true, edit: true, archive: true, delete: false, approve: true, send: true, voidCredit: false },
    tenders: { view: true, create: true, edit: true, archive: true, delete: false, approve: true, send: true, voidCredit: false },
    projects: { view: true, create: true, edit: true, archive: true, delete: false, approve: true, send: false, voidCredit: false },
    jobs: { view: true, create: true, edit: true, archive: true, delete: false, approve: true, send: false, voidCredit: false },
    scheduling: { view: true, create: true, edit: true, archive: true, delete: false, approve: true, send: false, voidCredit: false },
    timesheets: { view: true, create: true, edit: true, archive: false, delete: false, approve: true, send: false, voidCredit: false },
    variations: { view: true, create: true, edit: true, archive: true, delete: false, approve: true, send: false, voidCredit: false },
    rfis: { view: true, create: true, edit: true, archive: true, delete: false, approve: true, send: true, voidCredit: false },
    documents: { view: true, create: true, edit: true, archive: true, delete: false, approve: false, send: false, voidCredit: false },
    safety: { view: true, create: true, edit: true, archive: true, delete: false, approve: true, send: false, voidCredit: false },
    punchLists: { view: true, create: true, edit: true, archive: true, delete: false, approve: true, send: false, voidCredit: false },
    financial: { view: true, create: true, edit: true, archive: false, delete: false, approve: true, send: false, voidCredit: false },
    reports: { view: true, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    userManagement: { view: false, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    auditLog: { view: false, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
  },

  SITE_MANAGER: {
    customers: { view: true, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    sites: { view: true, create: false, edit: true, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    suppliers: { view: true, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    crew: { view: true, create: true, edit: true, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    leads: { view: false, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    quotes: { view: false, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    tenders: { view: false, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    projects: { view: true, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    jobs: { view: true, create: true, edit: true, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    scheduling: { view: true, create: true, edit: true, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    timesheets: { view: true, create: true, edit: true, archive: false, delete: false, approve: true, send: false, voidCredit: false },
    variations: { view: true, create: true, edit: true, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    rfis: { view: true, create: true, edit: true, archive: false, delete: false, approve: false, send: true, voidCredit: false },
    documents: { view: true, create: true, edit: true, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    safety: { view: true, create: true, edit: true, archive: false, delete: false, approve: true, send: false, voidCredit: false },
    punchLists: { view: true, create: true, edit: true, archive: false, delete: false, approve: true, send: false, voidCredit: false },
    financial: { view: false, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    reports: { view: true, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    userManagement: { view: false, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    auditLog: { view: false, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
  },

  FIELD_WORKER: {
    customers: { view: false, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    sites: { view: true, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    suppliers: { view: false, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    crew: { view: false, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    leads: { view: false, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    quotes: { view: false, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    tenders: { view: false, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    projects: { view: false, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    jobs: { view: true, create: false, edit: true, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    scheduling: { view: true, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    timesheets: { view: true, create: true, edit: true, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    variations: { view: true, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    rfis: { view: true, create: true, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    documents: { view: true, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    safety: { view: true, create: true, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    punchLists: { view: true, create: true, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    financial: { view: false, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    reports: { view: false, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    userManagement: { view: false, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    auditLog: { view: false, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
  },

  FINANCE_MANAGER: {
    customers: { view: true, create: true, edit: true, archive: true, delete: false, approve: false, send: false, voidCredit: false },
    sites: { view: true, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    suppliers: { view: true, create: true, edit: true, archive: true, delete: false, approve: false, send: false, voidCredit: false },
    crew: { view: true, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    leads: { view: false, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    quotes: { view: true, create: true, edit: true, archive: true, delete: false, approve: true, send: true, voidCredit: false },
    tenders: { view: false, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    projects: { view: true, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    jobs: { view: true, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    scheduling: { view: false, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    timesheets: { view: true, create: false, edit: false, archive: false, delete: false, approve: true, send: false, voidCredit: false },
    variations: { view: true, create: false, edit: false, archive: false, delete: false, approve: true, send: false, voidCredit: false },
    rfis: { view: false, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    documents: { view: true, create: true, edit: true, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    safety: { view: false, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    punchLists: { view: false, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    financial: { view: true, create: true, edit: true, archive: true, delete: false, approve: true, send: true, voidCredit: true },
    reports: { view: true, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    userManagement: { view: false, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
    auditLog: { view: true, create: false, edit: false, archive: false, delete: false, approve: false, send: false, voidCredit: false },
  },
};

/**
 * Calculates final effective permissions for a user given their role,
 * individual user overrides, and Account Admin status.
 *
 * HIERARCHY:
 * Role Template (Default)
 *      ↓
 * User Override (Inherit / Allow / Deny)
 *      ↓
 * Effective Permission
 */
export function calculateEffectivePermissions(
  role?: UserRole | null,
  userOverrides?: UserModuleOverrides | null,
  isAccountAdmin?: boolean
): FullEffectivePermissions {
  // If no role or unauthenticated, default to full denial
  if (!role) {
    const empty: Partial<FullEffectivePermissions> = {};
    MODULE_DEFINITIONS.forEach((m) => {
      empty[m.key] = createEmptyModulePermissions();
    });
    return empty as FullEffectivePermissions;
  }

  // Account Owners and Account Administrators have full access across every module
  if (role === "OWNER" || role === "ACCOUNT_ADMIN" || isAccountAdmin === true) {
    const full: Partial<FullEffectivePermissions> = {};
    MODULE_DEFINITIONS.forEach((m) => {
      full[m.key] = createFullModulePermissions();
    });
    return full as FullEffectivePermissions;
  }

  const roleDefaults = ROLE_DEFAULT_TEMPLATES[role] || ROLE_DEFAULT_TEMPLATES.FIELD_WORKER;
  const effective: Partial<FullEffectivePermissions> = {};

  MODULE_DEFINITIONS.forEach((m) => {
    const modKey = m.key;
    const defaults = roleDefaults[modKey] || createEmptyModulePermissions();
    const modOverrides = userOverrides?.[modKey] || {};

    const resolved: ModulePermissions = { ...defaults };

    ALL_PERMISSION_ACTIONS.forEach((action) => {
      const override = modOverrides[action];
      if (override === "ALLOW") {
        resolved[action] = true;
      } else if (override === "DENY") {
        resolved[action] = false;
      }
      // If "INHERIT" or undefined, resolved[action] stays defaults[action]
    });

    effective[modKey] = resolved;
  });

  return effective as FullEffectivePermissions;
}

/**
 * Checks if a specific action on a module is permitted for the user.
 */
export function checkActionPermitted(
  effectivePermissions: FullEffectivePermissions,
  moduleKey: ModuleKey,
  action: PermissionAction
): boolean {
  return Boolean(effectivePermissions[moduleKey]?.[action]);
}

/**
 * React hook to reactively retrieve effective permissions for the currently logged in user.
 */
export function usePermissions() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const [userOverrides, setUserOverrides] = useState<UserModuleOverrides | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOverrides = useCallback(async () => {
    if (!currentUser?.id) {
      setUserOverrides(null);
      setLoading(false);
      return;
    }

    try {
      const records = await db.user_permissions
        .where("userId")
        .equals(currentUser.id)
        .toArray();

      const mapped: UserModuleOverrides = {} as UserModuleOverrides;
      records.forEach((r) => {
        mapped[r.module] = r.overrides;
      });
      setUserOverrides(mapped);
    } catch (e) {
      console.error("Failed to load user permission overrides:", e);
      setUserOverrides(null);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    loadOverrides();

    const handlePermissionsUpdated = () => {
      loadOverrides();
    };
    window.addEventListener("permissions-updated", handlePermissionsUpdated);
    return () => {
      window.removeEventListener("permissions-updated", handlePermissionsUpdated);
    };
  }, [loadOverrides]);

  const activeRole = currentUser?.role || "OWNER";
  const isAccountAdmin =
    currentUser?.role === "OWNER" ||
    currentUser?.role === "ACCOUNT_ADMIN" ||
    currentUser?.isAccountAdmin === true ||
    !currentUser;

  const effectivePermissions = useMemo(() => {
    return calculateEffectivePermissions(
      activeRole,
      userOverrides,
      isAccountAdmin
    );
  }, [activeRole, isAccountAdmin, userOverrides]);

  const hasPermission = useCallback(
    (moduleKey: ModuleKey, action: PermissionAction): boolean => {
      return checkActionPermitted(effectivePermissions, moduleKey, action);
    },
    [effectivePermissions]
  );

  return {
    effectivePermissions,
    hasPermission,
    userOverrides,
    loading,
    refreshPermissions: loadOverrides,
  };
}

/**
 * SAFEGUARD: Checks whether an Account Administrator can be demoted or deleted.
 * Requirement: At least one Account Administrator must exist at all times.
 */
export async function canDemoteOrRemoveAccountAdmin(
  targetUserId: number,
  companyId: string
): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const allUsers = await db.users.where("companyId").equals(companyId).toArray();
    const adminCount = allUsers.filter(
      (u) => u.role === "OWNER" || u.role === "ACCOUNT_ADMIN" || u.isAccountAdmin === true
    ).length;

    const target = allUsers.find((u) => u.id === targetUserId);
    const targetIsAdmin =
      target?.role === "OWNER" || target?.role === "ACCOUNT_ADMIN" || target?.isAccountAdmin === true;

    if (targetIsAdmin && adminCount <= 1) {
      return {
        allowed: false,
        reason: "Security Safeguard: At least one Account Administrator must always remain for the organization.",
      };
    }

    return { allowed: true };
  } catch (err) {
    console.error("Error evaluating admin safeguard:", err);
    return { allowed: false, reason: "Failed to evaluate safeguard security check." };
  }
}

/**
 * Records permission or role modifications in the Audit Log.
 */
export async function recordPermissionAuditLog(params: {
  companyId: string;
  performer: { id?: number; name?: string; role?: string; [key: string]: any };
  targetUser: { id?: number; name?: string; role?: string; [key: string]: any };
  module: string;
  permission: string;
  oldValue: string;
  newValue: string;
}): Promise<void> {
  try {
    await db.audit_logs.add({
      companyId: params.companyId,
      performedByUserId: params.performer.id || 0,
      performedByUserName: params.performer.name || "Administrator",
      targetUserId: params.targetUser.id || 0,
      targetUserName: params.targetUser.name || "User",
      targetRole: params.targetUser.role || "MEMBER",
      module: params.module,
      permission: params.permission,
      oldValue: params.oldValue,
      newValue: params.newValue,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.error("Failed to write to audit log:", e);
  }
}
