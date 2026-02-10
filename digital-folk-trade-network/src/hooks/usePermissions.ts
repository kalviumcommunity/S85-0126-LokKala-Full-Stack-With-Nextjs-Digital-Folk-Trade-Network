"use client";

import { useAuth } from "@/hooks/useAuth";
import {
  Action,
  AppRole,
  canPerform,
  checkAccess,
  listPermissions,
  Resource,
  ROLE_DESCRIPTIONS,
} from "@/lib/rbac";
import { useMemo } from "react";

/* =========================
   Hooks
   ========================= */

/**
 * Hook to check user permissions
 * 
 * @example
 * const { can, cannot, hasRole, permissions, role } = usePermissions();
 * 
 * if (can('artifacts:create')) {
 *   // Show create button
 * }
 * 
 * if (hasRole('ADMIN')) {
 *   // Show admin panel
 * }
 */
export function usePermissions() {
  const { user } = useAuth();
  const role = (user?.role || "GUEST") as AppRole;
  
  const permissions = useMemo(() => listPermissions(role), [role]);
  
  const can = (action: string, isOwner: boolean = false): boolean => {
    const result = checkAccess({
      role,
      action,
      isOwner,
      userId: user?.id,
    });
    return result.allowed;
  };
  
  const cannot = (action: string, isOwner: boolean = false): boolean => {
    return !can(action, isOwner);
  };
  
  const hasRole = (requiredRole: AppRole | AppRole[]): boolean => {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return roles.includes(role);
  };
  
  const canAccessResource = (
    resource: Resource,
    action: Action,
    isOwner: boolean = false
  ): boolean => {
    return canPerform(role, resource, action, isOwner);
  };
  
  const isAdmin = role === "ADMIN";
  const isArtist = role === "ARTIST";
  const isUser = role === "USER";
  const isGuest = role === "GUEST";
  
  return {
    can,
    cannot,
    hasRole,
    canAccessResource,
    permissions,
    role,
    roleDescription: ROLE_DESCRIPTIONS[role],
    isAdmin,
    isArtist,
    isUser,
    isGuest,
  };
}

/**
 * Hook to get specific permission handler
 * 
 * @example
 * const canDelete = usePermission('artifacts:delete', true);
 * 
 * return (
 *   <button disabled={!canDelete}>Delete</button>
 * );
 */
export function usePermission(action: string, isOwner: boolean = false): boolean {
  const { can } = usePermissions();
  return useMemo(() => can(action, isOwner), [action, isOwner, can]);
}

/**
 * Hook to check if user has specific role
 * 
 * @example
 * const isAdmin = useRole('ADMIN');
 * const isStaff = useRole(['ADMIN', 'ARTIST']);
 */
export function useRole(requiredRole: AppRole | AppRole[]): boolean {
  const { hasRole } = usePermissions();
  return useMemo(() => hasRole(requiredRole), [requiredRole, hasRole]);
}
