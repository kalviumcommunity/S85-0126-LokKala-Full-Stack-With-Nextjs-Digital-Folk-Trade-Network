import { Role } from "@prisma/client";

type OwnershipAware = { isOwner?: boolean };
export type AppRole = Role | "GUEST";

const ROLE_PERMISSIONS: Record<AppRole, string[]> = {
  ADMIN: ["*"],
  ARTIST: [
    "orders:read:own",
    "orders:write:own",
    "tasks:read",
    "tasks:write",
    "projects:read",
    "users:read:own",
  ],
  USER: ["orders:read:own", "orders:write:own", "tasks:read", "projects:read", "users:read:own"],
  GUEST: [],
};

function buildPermission(action: string, opts?: OwnershipAware) {
  return opts?.isOwner ? `${action}:own` : action;
}

function hasPermission(role: AppRole, permission: string) {
  const permissions = ROLE_PERMISSIONS[role] ?? [];
  return permissions.includes("*") || permissions.includes(permission);
}

export function auditAccess(params: {
  role: AppRole;
  permission: string;
  resource?: string;
  allowed: boolean;
  reason?: string;
}) {
  const { role, permission, resource, allowed, reason } = params;
  console.log(
    `[RBAC] role=${role} permission=${permission} resource=${resource ?? "n/a"} decision=${
      allowed ? "ALLOWED" : "DENIED"
    }${reason ? ` reason=${reason}` : ""}`
  );
}

export function checkAccess(opts: {
  role: AppRole;
  action: string;
  resource?: string;
  isOwner?: boolean;
  reason?: string;
}) {
  const permission = buildPermission(opts.action, { isOwner: opts.isOwner });
  const allowed = hasPermission(opts.role, permission);
  auditAccess({ role: opts.role, permission, resource: opts.resource, allowed, reason: opts.reason });
  return { allowed, permission };
}

export function listPermissions(role: AppRole) {
  return ROLE_PERMISSIONS[role] ?? [];
}

export const ROLE_POLICY_TABLE = ROLE_PERMISSIONS;
