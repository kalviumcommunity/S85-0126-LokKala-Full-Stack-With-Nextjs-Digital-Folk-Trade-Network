# 🔐 Role-Based Access Control (RBAC) System

## Overview

This project implements a comprehensive Role-Based Access Control (RBAC) system to manage user permissions across the Digital Folk Trade Network. The RBAC system provides granular access control, audit logging, and flexible permission management for API routes and UI components.

## Table of Contents

- [Roles and Permissions](#roles-and-permissions)
- [Architecture](#architecture)
- [Usage Guide](#usage-guide)
  - [API Route Protection](#api-route-protection)
  - [UI Permission Guards](#ui-permission-guards)
  - [Permission Checks](#permission-checks)
- [Audit Logging](#audit-logging)
- [Test Cases](#test-cases)
- [Scalability and Future Growth](#scalability-and-future-growth)

---

## Roles and Permissions

### Role Hierarchy

The system defines four distinct roles with increasing levels of access:

| Role       | Description                | Permission Count |
| ---------- | -------------------------- | ---------------- |
| **GUEST**  | Unauthenticated visitor    | 3                |
| **USER**   | Regular authenticated user | 9                |
| **ARTIST** | Content creator/seller     | 19               |
| **ADMIN**  | System administrator       | Unlimited (\*)   |

### Detailed Permission Matrix

#### Artifacts (Marketplace Items)

| Action       | ADMIN | ARTIST | USER | GUEST |
| ------------ | :---: | :----: | :--: | :---: |
| Create       |  ✅   |   ✅   |  ❌  |  ❌   |
| Read         |  ✅   |   ✅   |  ✅  |  ✅   |
| Update (own) |  ✅   |   ✅   |  ❌  |  ❌   |
| Delete (own) |  ✅   |   ✅   |  ❌  |  ❌   |

#### Orders

| Action       | ADMIN | ARTIST | USER | GUEST |
| ------------ | :---: | :----: | :--: | :---: |
| Create       |  ✅   |   ❌   |  ✅  |  ❌   |
| Read (own)   |  ✅   |   ✅   |  ✅  |  ❌   |
| Update (own) |  ✅   |   ✅   |  ✅  |  ❌   |
| Delete       |  ✅   |   ❌   |  ❌  |  ❌   |

#### Reviews

| Action       | ADMIN | ARTIST | USER | GUEST |
| ------------ | :---: | :----: | :--: | :---: |
| Create (own) |  ✅   |   ✅   |  ✅  |  ❌   |
| Read         |  ✅   |   ✅   |  ✅  |  ❌   |
| Update (own) |  ✅   |   ✅   |  ✅  |  ❌   |
| Delete (own) |  ✅   |   ✅   |  ✅  |  ❌   |

#### User Management

| Action       | ADMIN | ARTIST | USER | GUEST |
| ------------ | :---: | :----: | :--: | :---: |
| Read (own)   |  ✅   |   ✅   |  ✅  |  ❌   |
| Update (own) |  ✅   |   ✅   |  ✅  |  ❌   |
| Delete       |  ✅   |   ❌   |  ❌  |  ❌   |

#### Tasks & Projects

| Action | ADMIN | ARTIST | USER | GUEST |
| ------ | :---: | :----: | :--: | :---: |
| Create |  ✅   |   ✅   |  ❌  |  ❌   |
| Read   |  ✅   |   ✅   |  ✅  |  ✅   |
| Update |  ✅   |   ✅   |  ❌  |  ❌   |
| Delete |  ✅   |   ✅   |  ❌  |  ❌   |

### Permission Format

Permissions follow the pattern: `resource:action[:scope]`

- **resource**: The entity being accessed (e.g., `artifacts`, `orders`, `users`)
- **action**: The operation (e.g., `create`, `read`, `update`, `delete`)
- **scope** (optional): Ownership qualifier (`:own` restricts to user's own resources)

**Examples:**

- `artifacts:create` - Can create artifacts
- `orders:read:own` - Can read only their own orders
- `*` - Superuser (all permissions)

---

## Architecture

### Core Components

```
src/
├── lib/
│   ├── rbac.ts              # Core RBAC logic and permissions
│   ├── rbacMiddleware.ts    # API route protection helpers
│   └── rbacTests.ts         # Comprehensive test suite
├── hooks/
│   └── usePermissions.ts    # React hooks for permissions
├── components/
│   └── rbac/
│       └── PermissionGuards.tsx  # UI guard components
└── app/
    ├── api/
    │   ├── admin/
    │   │   ├── route.ts     # Admin-only endpoint
    │   │   └── audit-logs/
    │   │       └── route.ts # Audit log access
    │   └── artifacts/
    │       └── [id]/
    │           └── route.ts # Protected CRUD operations
    └── rbac-demo/
        └── page.tsx         # Interactive demo page
```

### Access Evaluation Logic

```typescript
// 1. Authenticate user (JWT validation)
const user = await requireAuthPayload(req);

// 2. Check ownership (if applicable)
const isOwner = resource.userId === user.sub;

// 3. Build permission string
const permission = isOwner ? "resource:action:own" : "resource:action";

// 4. Evaluate against role permissions
const allowed =
  ROLE_PERMISSIONS[user.role].includes(permission) ||
  ROLE_PERMISSIONS[user.role].includes("*");

// 5. Audit the decision
auditAccess({ role, permission, allowed, userId, metadata });

// 6. Return result
return { allowed, reason: allowed ? null : "Insufficient permissions" };
```

---

## Usage Guide

### API Route Protection

#### Method 1: Using `withRBAC` Helper

```typescript
import { withRBAC } from "@/lib/rbacMiddleware";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { user, error } = await withRBAC(req, {
    action: "artifacts:update",
    resource: "artifacts",
    requireOwnership: true,
  });

  if (error) return error;

  // User is authenticated and authorized
  // Proceed with update logic...
}
```

#### Method 2: Using Role Requirements

```typescript
import { requireRole, requireAdmin } from "@/lib/rbacMiddleware";

// Require specific role(s)
export async function POST(req: Request) {
  const { user, error } = await requireRole(req, ["ADMIN", "ARTIST"]);
  if (error) return error;

  // Only admins and artists can proceed
}

// Require admin
export async function DELETE(req: Request) {
  const { user, error } = await requireAdmin(req);
  if (error) return error;

  // Only admins can proceed
}
```

#### Method 3: Manual Permission Check

```typescript
import { requireAuthPayload } from "@/lib/auth";
import { checkAccess, AppRole } from "@/lib/rbac";

export async function GET(req: Request) {
  const auth = await requireAuthPayload(req);
  if (!auth) return sendError("Unauthorized", 401);

  const decision = checkAccess({
    role: auth.role as AppRole,
    action: "users:read",
    resource: "users",
    userId: auth.sub,
  });

  if (!decision.allowed) {
    return sendError("Forbidden", 403);
  }

  // Proceed with logic...
}
```

#### Ownership Verification

```typescript
import { verifyOwnership } from "@/lib/rbacMiddleware";

const artifact = await prisma.artifact.findUnique({ where: { id } });
const isOwner = verifyOwnership(artifact, "sellerId", user.sub);

const decision = checkAccess({
  role: user.role,
  action: "artifacts:update",
  isOwner,
  userId: user.sub,
});
```

### UI Permission Guards

#### Component-Based Guards

```tsx
import { Can, AdminOnly, ArtistOnly, RoleGuard } from "@/components/rbac/PermissionGuards";

// Show content based on permission
<Can do="artifacts:create">
  <button>Create New Artifact</button>
</Can>

// Show content with ownership check
<Can do="artifacts:delete" isOwner={true}>
  <button>Delete My Artifact</button>
</Can>

// Show content with fallback
<Can do="orders:create" fallback={<LoginPrompt />}>
  <CheckoutButton />
</Can>

// Role-specific guards
<AdminOnly>
  <AdminDashboard />
</AdminOnly>

<ArtistOnly fallback={<BecomeArtistPrompt />}>
  <ArtistStudio />
</ArtistOnly>

<RoleGuard role={["ADMIN", "ARTIST"]}>
  <StaffPanel />
</RoleGuard>
```

#### Hook-Based Permission Checks

```tsx
import { usePermissions, usePermission, useRole } from "@/hooks/usePermissions";

function MyComponent() {
  const { can, cannot, hasRole, isAdmin } = usePermissions();

  // Check specific permission
  if (can("artifacts:create")) {
    // Show create button
  }

  // Check with ownership
  if (can("artifacts:delete", true)) {
    // Can delete own artifacts
  }

  // Role check
  if (isAdmin) {
    // Admin-specific logic
  }

  return (
    <div>
      <button disabled={cannot("orders:create")}>Place Order</button>
    </div>
  );
}

// Single permission hook
function DeleteButton({ isOwner }: { isOwner: boolean }) {
  const canDelete = usePermission("artifacts:delete", isOwner);

  return <button disabled={!canDelete}>Delete</button>;
}

// Role check hook
function AdminTools() {
  const isAdmin = useRole("ADMIN");
  if (!isAdmin) return null;

  return <AdminToolbar />;
}
```

### Permission Checks

#### List User Permissions

```typescript
import { listPermissions } from "@/lib/rbac";

const permissions = listPermissions("ARTIST");
console.log(permissions);
// ["artifacts:create", "artifacts:read", "artifacts:update:own", ...]
```

#### Check Specific Resource Action

```typescript
import { canPerform } from "@/lib/rbac";

const allowed = canPerform("USER", "orders", "create");
if (allowed) {
  // User can create orders
}
```

---

## Audit Logging

### Features

The RBAC system includes comprehensive audit logging for compliance and monitoring:

- ✅ Every access check is logged
- ✅ Tracks allowed and denied actions
- ✅ Includes user ID, role, permission, and metadata
- ✅ Color-coded console output for development
- ✅ Persistent in-memory storage (last 1000 entries)
- ✅ Statistics aggregation by role

### Log Format

```typescript
[RBAC ✅] role=ARTIST permission=artifacts:create resource=artifacts userId=5 decision=ALLOWED
[RBAC ❌] role=USER permission=users:delete resource=users userId=8 decision=DENIED reason="Insufficient permissions"
```

### Accessing Audit Logs

```typescript
import { getAuditLogs, getAuditStats } from "@/lib/rbac";

// Get recent logs
const logs = getAuditLogs(50); // Last 50 entries

// Get statistics
const stats = getAuditStats();
console.log(stats);
/*
{
  total: 145,
  allowed: 120,
  denied: 25,
  byRole: {
    ADMIN: { allowed: 50, denied: 0 },
    ARTIST: { allowed: 45, denied: 10 },
    USER: { allowed: 20, denied: 15 },
    GUEST: { allowed: 5, denied: 0 }
  }
}
*/
```

### Admin Audit Endpoint

```bash
GET /api/admin/audit-logs?limit=100
Authorization: Bearer <admin-token>

Response:
{
  "success": true,
  "data": {
    "logs": [...],
    "stats": {...},
    "meta": {
      "limit": 100,
      "returned": 87
    }
  }
}
```

### Audit Log Structure

```typescript
{
  timestamp: "2026-02-10T10:30:45.123Z",
  role: "ARTIST",
  permission: "artifacts:update:own",
  resource: "artifacts",
  action: "artifacts:update",
  userId: 42,
  decision: "ALLOWED",
  reason: null,
  metadata: {
    artifactId: 123,
    sellerId: 42
  }
}
```

---

## Test Cases

### Running Tests

```bash
# Run comprehensive RBAC test suite
npm run test:rbac

# Or manually
node -r ts-node/register src/lib/rbacTests.ts
```

### Test Coverage

The test suite includes:

1. **Role Permission Listing** - Verifies each role's permissions
2. **Allowed Actions** - Tests successful access scenarios
3. **Denied Actions** - Tests blocked access scenarios
4. **Ownership-Based Access** - Tests own vs. other resource access
5. **CRUD Matrix** - Comprehensive operation matrix
6. **Audit Statistics** - Verifies logging functionality

### Example Test Output

```
==============================================================
🔐 RBAC SYSTEM TEST SUITE
==============================================================

📋 TEST 1: Role Permissions Listing

ADMIN:
  Permissions (1):
    • *

ARTIST:
  Permissions (19):
    • artifacts:create
    • artifacts:read
    • artifacts:update:own
    • artifacts:delete:own
    • orders:read:own
    ... and 14 more

✅ TEST 2: ALLOWED Actions

ADMIN Role:
[RBAC ✅] role=ADMIN permission=users:delete resource=users userId=1 decision=ALLOWED
[RBAC ✅] role=ADMIN permission=artifacts:update resource=artifacts userId=1 decision=ALLOWED

ARTIST Role:
[RBAC ✅] role=ARTIST permission=artifacts:create resource=artifacts userId=2 decision=ALLOWED
[RBAC ✅] role=ARTIST permission=artifacts:update:own resource=artifacts userId=2 decision=ALLOWED

❌ TEST 3: DENIED Actions

GUEST Role (should be denied):
[RBAC ❌] role=GUEST permission=artifacts:create resource=artifacts decision=DENIED reason="Guest users cannot create content"
[RBAC ❌] role=GUEST permission=orders:create resource=orders decision=DENIED reason="Guest users must login to place orders"

📊 TEST 5: CRUD Operations Matrix

Artifacts Permissions:
Role      | Create | Read | Update (own) | Delete (own)
----------|--------|------|--------------|-------------
ADMIN     | ✅    | ✅   | ✅          | ✅
ARTIST    | ✅    | ✅   | ✅          | ✅
USER      | ❌    | ✅   | ❌          | ❌
GUEST     | ❌    | ✅   | ❌          | ❌

📈 TEST 6: Audit Statistics

Total Access Checks: 28
Allowed: 19 (67.9%)
Denied: 9 (32.1%)

By Role:
  ADMIN: 8 allowed, 0 denied (8 total)
  ARTIST: 7 allowed, 3 denied (10 total)
  USER: 3 allowed, 4 denied (7 total)
  GUEST: 1 allowed, 2 denied (3 total)
```

### Interactive Demo

Visit `/rbac-demo` to see an interactive demonstration of:

- Current user permissions
- Role-based component rendering
- Permission-based button states
- Live CRUD operation matrix
- Code examples

---

## Scalability and Future Growth

### Current Strengths

1. **Modular Design**: Permissions are centrally defined but easily extensible
2. **Type Safety**: Full TypeScript support with strict typing
3. **Separation of Concerns**: Clear separation between auth and RBAC
4. **Audit Trail**: Built-in logging for compliance and debugging
5. **Flexible Integration**: Works seamlessly in API routes and UI components

### Scalability Considerations

#### 1. **Database-Driven Roles** (Phase 2)

Move role definitions from code to database for dynamic management:

```typescript
// Future: Load from database
const roles = await prisma.role.findMany({
  include: { permissions: true },
});
```

Benefits:

- Runtime permission updates without deployment
- Role creation via admin UI
- Per-user permission overrides

#### 2. **Policy-Based Access Control (PBAC)**

Evolve from simple role checks to complex policy evaluation:

```typescript
// Future: Policy engine
const policy = {
  effect: "ALLOW",
  actions: ["artifacts:update"],
  resources: ["artifact:*"],
  conditions: {
    isOwner: true,
    timeOfDay: { after: "09:00", before: "17:00" },
    ipWhitelist: ["192.168.1.0/24"],
  },
};

evaluatePolicy(user, action, resource, policy);
```

Benefits:

- Context-aware access control
- Time-based restrictions
- IP/location-based rules
- Conditional logic (if-then rules)

#### 3. **Attribute-Based Access Control (ABAC)**

Use user and resource attributes for fine-grained control:

```typescript
// Future: Attribute-based decisions
checkAccess({
  userAttributes: {
    role: "ARTIST",
    department: "Painting",
    level: "Senior",
    certifications: ["Quality"],
  },
  resourceAttributes: {
    type: "artifact",
    category: "Painting",
    sensitivity: "High",
  },
  action: "update",
});
```

#### 4. **External Policy Service**

Integrate with external authorization services (e.g., Open Policy Agent, AWS IAM):

```typescript
// Future: External policy decision point
const decision = await opa.evaluate({
  input: {
    user: { role, id, attributes },
    action,
    resource,
  },
});
```

#### 5. **Permission Inheritance**

Implement role hierarchy with permission inheritance:

```graphql
SUPER_ADMIN extends ADMIN
ADMIN extends ARTIST
ARTIST extends USER
USER extends GUEST
```

#### 6. **Resource-Level Policies**

Attach policies directly to resources:

```typescript
// Future: Resource-specific policies
artifact.accessPolicy = {
  read: ["PUBLIC"],
  update: ["OWNER", "role:ADMIN"],
  delete: ["OWNER"],
};
```

### Performance Optimization

For high-scale deployments:

1. **Permission Caching**: Cache role permissions with Redis
2. **Batch Checks**: Evaluate multiple permissions in one call
3. **Lazy Loading**: Load permissions on-demand
4. **Permission Denormalization**: Store computed permissions with user records

### Migration Path

```
Current: Static RBAC
    ↓
Phase 1: Database-driven roles
    ↓
Phase 2: Simple policies (conditions)
    ↓
Phase 3: Full PBAC/ABAC
    ↓
Phase 4: External authorization service
```

### Compliance and Auditing

Future enhancements for regulatory compliance:

- **Persistent Audit Logs**: Store in database with retention policies
- **Audit Log Export**: Export logs for compliance reporting
- **Access Reviews**: Periodic permission audits
- **Separation of Duties**: Conflict detection across roles
- **Principle of Least Privilege**: Automatic permission minimization

---

## Best Practices

### API Routes

✅ **DO:**

- Always authenticate before checking permissions
- Use ownership checks for user-specific resources
- Return appropriate HTTP status codes (401, 403)
- Log all access decisions for audit trails

❌ **DON'T:**

- Bypass RBAC checks for "quick fixes"
- Rely solely on client-side permission checks
- Expose sensitive data in error messages
- Grant permissions without explicit need

### UI Components

✅ **DO:**

- Hide UI elements users can't access
- Disable buttons for unavailable actions
- Show helpful messages when access is denied
- Use permission guards consistently

❌ **DON'T:**

- Rely only on UI guards for security
- Show confusing "access denied" everywhere
- Make users guess why they can't access something

### General

✅ **DO:**

- Follow the principle of least privilege
- Document permission requirements
- Test both positive and negative cases
- Review permissions regularly

❌ **DON'T:**

- Grant ADMIN role liberally
- Hardcode permission checks throughout code
- Ignore audit logs
- Skip authorization in "internal" APIs

---

## Reflection

### How RBAC Supports Scalability

1. **Centralized Management**: All permissions defined in one place makes updates easy
2. **Type Safety**: TypeScript ensures permission strings are valid
3. **Modular Architecture**: Easy to extend with new resources/actions
4. **Audit Trail**: Logging supports compliance and debugging at scale
5. **Flexible Integration**: Same RBAC system works in API and UI

### Evolution to Policy-Based Access

The current RBAC system provides a solid foundation for evolution:

1. **Current State**: Static role → permissions mapping
2. **Near Term**: Dynamic role loading from database
3. **Medium Term**: Conditional policies (time, location, attributes)
4. **Long Term**: Full PBAC/ABAC with external policy engine

The architecture supports this growth path without major refactoring because:

- Permission checks are abstracted behind functions
- Decision logic is centralized in `checkAccess()`
- Audit system already captures context/metadata
- Type system is flexible enough for complex policies

### Key Learnings

1. **Start Simple**: RBAC is easier to implement and maintain than complex policies
2. **Design for Growth**: Even simple RBAC needs audit logs and extensibility
3. **Security in Depth**: API protection + UI guards = better UX and security
4. **Developer Experience**: Good DX (hooks, components) drives adoption
5. **Observability**: Audit logs are crucial for debugging and compliance

---

## Contributors

- System designed for Digital Folk Trade Network
- Implemented: February 2026
- Version: 1.0.0

## License

MIT

---

For questions or issues, please contact the development team.
