"use client";

import { Can, Cannot, AdminOnly, ArtistOnly, RoleGuard, PermissionDisplay } from "@/components/rbac/PermissionGuards";
import { usePermissions } from "@/hooks/usePermissions";

/**
 * RBAC UI Component Examples
 * 
 * This page demonstrates all UI-level RBAC guards and permission checks
 */
export default function RBACDemoPage() {
  const { can } = usePermissions();
  
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">🔐 RBAC UI Demo</h1>
      
      {/* Current User Info */}
      <section className="mb-8 p-6 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Current User</h2>
        <PermissionDisplay className="text-sm" />
      </section>
      
      {/* Role-Based Components */}
      <section className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Role-Based Components</h2>
        
        <div className="space-y-4">
          <AdminOnly fallback={<p className="text-gray-500">Admin-only content hidden</p>}>
            <div className="p-4 bg-red-100 border border-red-300 rounded">
              <p className="font-semibold">🔴 Admin Only Content</p>
              <p className="text-sm">This is only visible to administrators</p>
            </div>
          </AdminOnly>
          
          <ArtistOnly fallback={<p className="text-gray-500">Artist-only content hidden</p>}>
            <div className="p-4 bg-purple-100 border border-purple-300 rounded">
              <p className="font-semibold">🎨 Artist Only Content</p>
              <p className="text-sm">This is only visible to artists</p>
            </div>
          </ArtistOnly>
          
          <RoleGuard role={["ADMIN", "ARTIST"]}>
            <div className="p-4 bg-green-100 border border-green-300 rounded">
              <p className="font-semibold">✅ Staff Content (Admin or Artist)</p>
              <p className="text-sm">Visible to admins and artists only</p>
            </div>
          </RoleGuard>
        </div>
      </section>
      
      {/* Permission-Based Components */}
      <section className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Permission-Based Components</h2>
        
        <div className="space-y-4">
          <Can do="artifacts:create">
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              ➕ Create Artifact
            </button>
          </Can>
          
          <Can do="artifacts:delete" isOwner={true}>
            <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
              🗑️ Delete My Artifact
            </button>
          </Can>
          
          <Cannot do="artifacts:delete">
            <p className="text-sm text-gray-600 italic">
              ℹ️ You don't have permission to delete artifacts
            </p>
          </Cannot>
        </div>
      </section>
      
      {/* Interactive Permission Checker */}
      <section className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Interactive Permission Checker</h2>
        
        <div className="space-y-3">
          <PermissionCheck action="artifacts:create" label="Create Artifact" />
          <PermissionCheck action="artifacts:read" label="Read Artifacts" />
          <PermissionCheck action="artifacts:update" label="Update Any Artifact" />
          <PermissionCheck action="artifacts:update" label="Update Own Artifact" isOwner />
          <PermissionCheck action="artifacts:delete" label="Delete Any Artifact" />
          <PermissionCheck action="artifacts:delete" label="Delete Own Artifact" isOwner />
          <PermissionCheck action="users:delete" label="Delete Users" />
          <PermissionCheck action="orders:create" label="Create Orders" />
          <PermissionCheck action="tasks:create" label="Create Tasks" />
        </div>
      </section>
      
      {/* CRUD Matrix */}
      <section className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">CRUD Operations Matrix</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2">Action</th>
                <th className="border border-gray-300 p-2">Allowed?</th>
                <th className="border border-gray-300 p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { action: "artifacts:create", label: "Create Artifact" },
                { action: "artifacts:read", label: "Read Artifacts" },
                { action: "artifacts:update:own", label: "Update Own Artifact" },
                { action: "artifacts:delete:own", label: "Delete Own Artifact" },
                { action: "orders:create", label: "Create Order" },
                { action: "orders:read:own", label: "View Own Orders" },
                { action: "users:delete", label: "Delete Users" },
              ].map((item) => {
                const allowed = can(item.action);
                return (
                  <tr key={item.action} className={allowed ? "bg-green-50" : "bg-red-50"}>
                    <td className="border border-gray-300 p-2 font-mono text-sm">{item.label}</td>
                    <td className="border border-gray-300 p-2 text-center">
                      {allowed ? "✅" : "❌"}
                    </td>
                    <td className="border border-gray-300 p-2 text-sm">
                      {allowed ? "Allowed" : "Denied"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      
      {/* Usage Examples */}
      <section className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Code Examples</h2>
        
        <div className="space-y-4">
          <CodeExample
            title="Simple Permission Check"
            code={`<Can do="artifacts:create">
  <button>Create Artifact</button>
</Can>`}
          />
          
          <CodeExample
            title="Ownership Check"
            code={`<Can do="artifacts:delete" isOwner={true}>
  <button>Delete My Artifact</button>
</Can>`}
          />
          
          <CodeExample
            title="Role Guard"
            code={`<AdminOnly fallback={<p>Access Denied</p>}>
  <AdminPanel />
</AdminOnly>`}
          />
          
          <CodeExample
            title="Using Hook"
            code={`const { can, isAdmin } = usePermissions();

if (can('artifacts:create')) {
  // Show create button
}

if (isAdmin) {
  // Show admin panel
}`}
          />
        </div>
      </section>
    </div>
  );
}

// Helper component
function PermissionCheck({ action, label, isOwner = false }: { action: string; label: string; isOwner?: boolean }) {
  const { can } = usePermissions();
  const allowed = can(action, isOwner);
  
  return (
    <div className="flex items-center justify-between p-3 bg-white border rounded">
      <span className="font-mono text-sm">{label}</span>
      <span className={`px-3 py-1 rounded text-sm font-semibold ${allowed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {allowed ? '✅ Allowed' : '❌ Denied'}
      </span>
    </div>
  );
}

function CodeExample({ title, code }: { title: string; code: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-2">{title}</h3>
      <pre className="p-4 bg-gray-900 text-green-400 rounded text-xs overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
}
