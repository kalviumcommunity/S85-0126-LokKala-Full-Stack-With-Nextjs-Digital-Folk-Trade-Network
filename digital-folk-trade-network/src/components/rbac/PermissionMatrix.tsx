"use client";

import { AppRole, ROLE_PERMISSIONS, ROLE_DESCRIPTIONS, Resource, Action } from "@/lib/rbac";

interface PermissionMatrixProps {
  className?: string;
}

/**
 * PermissionMatrix Component
 * 
 * Displays a visual matrix of all roles and their permissions
 * Useful for admin dashboards and documentation
 */
export function PermissionMatrix({ className = "" }: PermissionMatrixProps) {
  const roles: AppRole[] = ["ADMIN", "ARTIST", "USER", "GUEST"];
  
  const resources: { name: Resource; actions: Action[] }[] = [
    { name: "artifacts", actions: ["create", "read", "update", "delete"] },
    { name: "orders", actions: ["create", "read", "update", "delete"] },
    { name: "reviews", actions: ["create", "read", "update", "delete"] },
    { name: "users", actions: ["read", "update", "delete"] },
    { name: "tasks", actions: ["create", "read", "update", "delete"] },
    { name: "projects", actions: ["create", "read", "update"] },
  ];
  
  const hasPermission = (role: AppRole, resource: Resource, action: Action, own: boolean = false): boolean => {
    const permissions = ROLE_PERMISSIONS[role];
    if (permissions.includes("*")) return true;
    
    const permission = own ? `${resource}:${action}:own` : `${resource}:${action}`;
    return permissions.includes(permission as any);
  };
  
  return (
    <div className={`overflow-x-auto ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Role Descriptions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {roles.map((role) => (
            <div key={role} className="flex items-start gap-2 text-sm">
              <span className="font-semibold min-w-[80px]">{role}:</span>
              <span className="text-gray-600 dark:text-gray-400">{ROLE_DESCRIPTIONS[role]}</span>
            </div>
          ))}
        </div>
      </div>
      
      {resources.map((resource) => (
        <div key={resource.name} className="mb-6">
          <h4 className="text-md font-semibold mb-2 capitalize">{resource.name}</h4>
          <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="border border-gray-300 dark:border-gray-700 p-2 text-left">Role</th>
                {resource.actions.map((action) => (
                  <th key={action} className="border border-gray-300 dark:border-gray-700 p-2 text-center capitalize">
                    {action}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="border border-gray-300 dark:border-gray-700 p-2 font-medium">
                    {role}
                  </td>
                  {resource.actions.map((action) => {
                    const hasAny = hasPermission(role, resource.name, action, false);
                    const hasOwn = hasPermission(role, resource.name, action, true);
                    
                    return (
                      <td key={action} className="border border-gray-300 dark:border-gray-700 p-2 text-center">
                        {hasAny && !hasOwn && (
                          <span className="text-green-600 dark:text-green-400" title="Can perform action on any resource">
                            ✅
                          </span>
                        )}
                        {hasOwn && !hasAny && (
                          <span className="text-yellow-600 dark:text-yellow-400" title="Can perform action only on own resources">
                            🔒
                          </span>
                        )}
                        {hasAny && hasOwn && (
                          <span className="text-green-600 dark:text-green-400" title="Can perform action on any resource">
                            ✅
                          </span>
                        )}
                        {!hasAny && !hasOwn && (
                          <span className="text-red-600 dark:text-red-400" title="Cannot perform action">
                            ❌
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <h4 className="font-semibold mb-2">Legend:</h4>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-green-600 dark:text-green-400">✅</span>
            <span>Can perform action on any resource</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-600 dark:text-yellow-400">🔒</span>
            <span>Can perform action only on own resources</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-red-600 dark:text-red-400">❌</span>
            <span>Cannot perform action</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * CompactPermissionList Component
 * 
 * Shows a compact list of permissions for a specific role
 */
interface CompactPermissionListProps {
  role: AppRole;
  className?: string;
}

export function CompactPermissionList({ role, className = "" }: CompactPermissionListProps) {
  const permissions = ROLE_PERMISSIONS[role];
  const isAdmin = permissions.includes("*");
  
  return (
    <div className={`p-4 border rounded-lg ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-lg">{role}</h3>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {isAdmin ? "All Permissions" : `${permissions.length} Permissions`}
        </span>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        {ROLE_DESCRIPTIONS[role]}
      </p>
      
      {isAdmin ? (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
          <p className="text-sm font-medium">🌟 Superuser Access</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            This role has unrestricted access to all resources and actions
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {permissions.slice(0, 10).map((permission, index) => (
            <div key={index} className="text-sm font-mono bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
              {permission}
            </div>
          ))}
          {permissions.length > 10 && (
            <p className="text-xs text-gray-500 italic mt-2">
              ... and {permissions.length - 10} more permissions
            </p>
          )}
        </div>
      )}
    </div>
  );
}
