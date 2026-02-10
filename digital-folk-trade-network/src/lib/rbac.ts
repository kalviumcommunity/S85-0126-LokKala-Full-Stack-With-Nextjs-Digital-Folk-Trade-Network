import { Role } from "@prisma/client";

/* =========================
   Types
   ========================= */
type OwnershipAware = { isOwner?: boolean };
export type AppRole = Role | "GUEST";

export type Action = "create" | "read" | "update" | "delete";
export type Resource =
  | "users"
  | "artifacts"
  | "orders"
  | "reviews"
  | "categories"
  | "tasks"
  | "projects"
  | "files"
  | "analytics";

export type Permission = `${Resource}:${Action}${":own" | ""}` | "*";

export interface AccessCheckResult {
  allowed: boolean;
  permission: string;
  role: AppRole;
  reason?: string;
}

/* =========================
   Role Configuration
   ========================= */

/**
 * ROLE_PERMISSIONS: Comprehensive role-based permission mapping
 * 
 * Permission format: "resource:action" or "resource:action:own"
 * - "*" grants all permissions (superuser)
 * - ":own" suffix restricts action to resources owned by the user
 * 
 * Roles:
 * - ADMIN: Full system access, can manage all resources
 * - ARTIST: Can manage their own artifacts, orders, and view marketplace data
 * - USER: Can browse, purchase, and manage their own orders
 * - GUEST: Read-only access to public resources
 */
export const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  ADMIN: ["*"], // Superuser - all permissions
  
  ARTIST: [
    // Artifact management (own)
    "artifacts:create",
    "artifacts:read",
    "artifacts:update:own",
    "artifacts:delete:own",
    
    // Order management
    "orders:read:own",
    "orders:update:own",
    
    // Reviews
    "reviews:read",
    "reviews:create:own",
    "reviews:update:own",
    "reviews:delete:own",
    
    // Tasks and projects
    "tasks:read",
    "tasks:create",
    "tasks:update",
    "tasks:delete",
    "projects:read",
    "projects:create",
    "projects:update",
    
    // User profile
    "users:read:own",
    "users:update:own",
    
    // Files
    "files:create",
    "files:read:own",
    "files:delete:own",
    
    // Analytics (own)
    "analytics:read:own",
  ],
  
  USER: [
    // Artifacts (read-only)
    "artifacts:read",
    
    // Order management (own)
    "orders:create",
    "orders:read:own",
    "orders:update:own",
    
    // Reviews
    "reviews:read",
    "reviews:create:own",
    "reviews:update:own",
    "reviews:delete:own",
    
    // Tasks and projects (read-only)
    "tasks:read",
    "projects:read",
    
    // User profile
    "users:read:own",
    "users:update:own",
    
    // Categories (read-only)
    "categories:read",
  ],
  
  GUEST: [
    // Public read-only access
    "artifacts:read",
    "categories:read",
    "projects:read",
  ],
};

/**
 * Human-readable role descriptions
 */
export const ROLE_DESCRIPTIONS: Record<AppRole, string> = {
  ADMIN: "Administrator with full system access",
  ARTIST: "Content creator who can sell artifacts and manage their inventory",
  USER: "Regular user who can browse and purchase artifacts",
  GUEST: "Unauthenticated visitor with read-only access",
};

/* =========================
   Permission Helpers
   ========================= */

/**
 * Build a permission string considering ownership
 */
function buildPermission(action: string, opts?: OwnershipAware): string {
  return opts?.isOwner ? `${action}:own` : action;
}

/**
 * Check if a role has a specific permission
 */
function hasPermission(role: AppRole, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role] ?? [];
  
  // Admin has all permissions
  if (permissions.includes("*")) {
    return true;
  }
  
  // Direct permission match
  if (permissions.includes(permission as Permission)) {
    return true;
  }
  
  // If checking a non-owned action, check if role has owned version
  // Example: checking "orders:read" should pass if role has "orders:read:own"
  if (!permission.endsWith(":own")) {
    const ownPermission = `${permission}:own`;
    return permissions.includes(ownPermission as Permission);
  }
  
  return false;
}

/* =========================
   Audit Logging
   ========================= */

export interface AuditLogEntry {
  timestamp: string;
  role: AppRole;
  permission: string;
  resource?: string;
  action?: string;
  userId?: number;
  decision: "ALLOWED" | "DENIED";
  reason?: string;
  metadata?: Record<string, unknown>;
}

const auditLogs: AuditLogEntry[] = [];

/**
 * Log access control decisions for auditing and compliance
 */
export function auditAccess(params: {
  role: AppRole;
  permission: string;
  resource?: string;
  action?: string;
  userId?: number;
  allowed: boolean;
  reason?: string;
  metadata?: Record<string, unknown>;
}): void {
  const { role, permission, resource, action, userId, allowed, reason, metadata } = params;
  
  const logEntry: AuditLogEntry = {
    timestamp: new Date().toISOString(),
    role,
    permission,
    resource,
    action,
    userId,
    decision: allowed ? "ALLOWED" : "DENIED",
    reason,
    metadata,
  };
  
  // Console output for development
  const emoji = allowed ? "✅" : "❌";
  const color = allowed ? "\x1b[32m" : "\x1b[31m"; // Green or Red
  const reset = "\x1b[0m";
  
  console.log(
    `${color}[RBAC ${emoji}]${reset} ` +
    `role=${role} ` +
    `permission=${permission} ` +
    `${resource ? `resource=${resource} ` : ""}` +
    `${action ? `action=${action} ` : ""}` +
    `${userId ? `userId=${userId} ` : ""}` +
    `decision=${allowed ? "ALLOWED" : "DENIED"}` +
    `${reason ? ` reason="${reason}"` : ""}`
  );
  
  // Store in memory (in production, send to logging service)
  auditLogs.push(logEntry);
  
  // Keep only last 1000 logs in memory
  if (auditLogs.length > 1000) {
    auditLogs.shift();
  }
}

/**
 * Get audit logs for analysis
 */
export function getAuditLogs(limit: number = 100): AuditLogEntry[] {
  return auditLogs.slice(-limit);
}

/**
 * Get audit statistics
 */
export function getAuditStats(): {
  total: number;
  allowed: number;
  denied: number;
  byRole: Record<string, { allowed: number; denied: number }>;
} {
  const stats = {
    total: auditLogs.length,
    allowed: 0,
    denied: 0,
    byRole: {} as Record<string, { allowed: number; denied: number }>,
  };
  
  auditLogs.forEach((log) => {
    if (log.decision === "ALLOWED") {
      stats.allowed++;
    } else {
      stats.denied++;
    }
    
    if (!stats.byRole[log.role]) {
      stats.byRole[log.role] = { allowed: 0, denied: 0 };
    }
    
    if (log.decision === "ALLOWED") {
      stats.byRole[log.role].allowed++;
    } else {
      stats.byRole[log.role].denied++;
    }
  });
  
  return stats;
}

/* =========================
   Access Control Functions
   ========================= */

/**
 * Check if a user has access to perform an action
 * 
 * @example
 * checkAccess({
 *   role: "ARTIST",
 *   action: "artifacts:update",
 *   isOwner: true,
 *   userId: 123
 * })
 */
export function checkAccess(opts: {
  role: AppRole;
  action: string;
  resource?: string;
  isOwner?: boolean;
  userId?: number;
  reason?: string;
  metadata?: Record<string, unknown>;
}): AccessCheckResult {
  const { role, action, resource, isOwner, userId, reason, metadata } = opts;
  
  const permission = buildPermission(action, { isOwner });
  const allowed = hasPermission(role, permission);
  
  auditAccess({
    role,
    permission,
    resource,
    action,
    userId,
    allowed,
    reason,
    metadata,
  });
  
  return {
    allowed,
    permission,
    role,
    reason: allowed ? undefined : reason || "Insufficient permissions",
  };
}

/**
 * Require access or throw error
 */
export function requireAccess(opts: {
  role: AppRole;
  action: string;
  resource?: string;
  isOwner?: boolean;
  userId?: number;
}): void {
  const result = checkAccess(opts);
  
  if (!result.allowed) {
    throw new Error(
      `Access denied: ${opts.role} cannot ${opts.action}${opts.resource ? ` on ${opts.resource}` : ""}`
    );
  }
}

/**
 * List all permissions for a role
 */
export function listPermissions(role: AppRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

/**
 * Check if user can perform CRUD operations on a resource
 */
export function canPerform(
  role: AppRole,
  resource: Resource,
  action: Action,
  isOwner: boolean = false
): boolean {
  const permission = isOwner ? `${resource}:${action}:own` : `${resource}:${action}`;
  return hasPermission(role, permission);
}

/* =========================
   Exports
   ========================= */

export const ROLE_POLICY_TABLE = ROLE_PERMISSIONS;

/**
 * Roles configuration for easy reference
 */
export const roles = {
  admin: ROLE_PERMISSIONS.ADMIN,
  artist: ROLE_PERMISSIONS.ARTIST,
  user: ROLE_PERMISSIONS.USER,
  guest: ROLE_PERMISSIONS.GUEST,
} as const;
