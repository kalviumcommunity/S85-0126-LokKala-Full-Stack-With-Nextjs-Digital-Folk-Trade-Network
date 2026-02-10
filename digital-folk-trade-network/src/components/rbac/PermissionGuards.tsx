"use client";

import { usePermissions, useRole } from "@/hooks/usePermissions";
import { AppRole } from "@/lib/rbac";
import { ReactNode } from "react";

/* =========================
   Permission Guard Components
   ========================= */

interface CanProps {
  do: string;
  isOwner?: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Conditionally render children based on permission
 * 
 * @example
 * <Can do="artifacts:create">
 *   <button>Create Artifact</button>
 * </Can>
 * 
 * @example
 * <Can do="artifacts:delete" isOwner={true} fallback={<p>You can't delete this</p>}>
 *   <button>Delete</button>
 * </Can>
 */
export function Can({ do: action, isOwner = false, children, fallback = null }: CanProps) {
  const { can } = usePermissions();
  
  if (can(action, isOwner)) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}

/**
 * Opposite of Can - render when user cannot perform action
 * 
 * @example
 * <Cannot do="artifacts:delete">
 *   <p>You don't have permission to delete artifacts</p>
 * </Cannot>
 */
export function Cannot({ do: action, isOwner = false, children }: CanProps) {
  const { cannot } = usePermissions();
  
  if (cannot(action, isOwner)) {
    return <>{children}</>;
  }
  
  return null;
}

interface RoleGuardProps {
  role: AppRole | AppRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Conditionally render based on user role
 * 
 * @example
 * <RoleGuard role="ADMIN">
 *   <AdminPanel />
 * </RoleGuard>
 * 
 * @example
 * <RoleGuard role={["ADMIN", "ARTIST"]} fallback={<p>Access denied</p>}>
 *   <CreatorDashboard />
 * </RoleGuard>
 */
export function RoleGuard({ role, children, fallback = null }: RoleGuardProps) {
  const hasRole = useRole(role);
  
  if (hasRole) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}

/**
 * Guard for admin-only content
 * 
 * @example
 * <AdminOnly>
 *   <button>Delete All Users</button>
 * </AdminOnly>
 */
export function AdminOnly({ children, fallback = null }: Omit<RoleGuardProps, "role">) {
  return (
    <RoleGuard role="ADMIN" fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * Guard for artist content
 * 
 * @example
 * <ArtistOnly>
 *   <CreateArtifactButton />
 * </ArtistOnly>
 */
export function ArtistOnly({ children, fallback = null }: Omit<RoleGuardProps, "role">) {
  return (
    <RoleGuard role="ARTIST" fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * Guard for authenticated users (any role except GUEST)
 * 
 * @example
 * <AuthenticatedOnly fallback={<LoginPrompt />}>
 *   <UserProfile />
 * </AuthenticatedOnly>
 */
export function AuthenticatedOnly({ children, fallback = null }: Omit<RoleGuardProps, "role">) {
  return (
    <RoleGuard role={["ADMIN", "ARTIST", "USER"]} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

interface PermissionDisplayProps {
  className?: string;
}

/**
 * Display current user's permissions (useful for debugging)
 * 
 * @example
 * <PermissionDisplay className="text-xs text-gray-500" />
 */
export function PermissionDisplay({ className }: PermissionDisplayProps) {
  const { role, permissions, roleDescription } = usePermissions();
  
  return (
    <div className={className}>
      <p className="font-semibold">
        Role: {role} <span className="font-normal text-gray-600">({roleDescription})</span>
      </p>
      <details className="mt-2">
        <summary className="cursor-pointer">Permissions ({permissions.length})</summary>
        <ul className="mt-2 space-y-1 pl-4">
          {permissions.map((permission, index) => (
            <li key={index} className="text-sm">
              • {permission}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
