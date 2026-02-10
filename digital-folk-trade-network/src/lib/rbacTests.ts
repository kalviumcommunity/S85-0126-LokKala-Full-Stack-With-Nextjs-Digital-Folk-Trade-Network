/**
 * RBAC Test Examples and Demonstrations
 * 
 * This file contains comprehensive test cases showing:
 * 1. Allowed actions for each role
 * 2. Denied actions for each role
 * 3. Ownership-based access control
 * 4. Audit logging output
 */

import { checkAccess, canPerform, listPermissions, getAuditStats, AppRole } from "@/lib/rbac";

/* =========================
   Test Configuration
   ========================= */

console.log("=".repeat(60));
console.log("🔐 RBAC SYSTEM TEST SUITE");
console.log("=".repeat(60));

/* =========================
   Test 1: Role Permissions Listing
   ========================= */

function testRolePermissions() {
  console.log("\n📋 TEST 1: Role Permissions Listing\n");
  
  const roles: AppRole[] = ["ADMIN", "ARTIST", "USER", "GUEST"];
  
  roles.forEach((role) => {
    const permissions = listPermissions(role);
    console.log(`${role}:`);
    console.log(`  Permissions (${permissions.length}):`);
    permissions.slice(0, 5).forEach((p) => console.log(`    • ${p}`));
    if (permissions.length > 5) {
      console.log(`    ... and ${permissions.length - 5} more`);
    }
    console.log();
  });
}

/* =========================
   Test 2: ALLOWED Actions
   ========================= */

function testAllowedActions() {
  console.log("\n✅ TEST 2: ALLOWED Actions\n");
  
  // Admin can do everything
  console.log("ADMIN Role:");
  checkAccess({
    role: "ADMIN",
    action: "users:delete",
    resource: "users",
    userId: 1,
  });
  checkAccess({
    role: "ADMIN",
    action: "artifacts:update",
    resource: "artifacts",
    userId: 1,
  });
  
  // Artist can create artifacts
  console.log("\nARTIST Role:");
  checkAccess({
    role: "ARTIST",
    action: "artifacts:create",
    resource: "artifacts",
    userId: 2,
  });
  checkAccess({
    role: "ARTIST",
    action: "artifacts:update",
    resource: "artifacts",
    isOwner: true,
    userId: 2,
  });
  checkAccess({
    role: "ARTIST",
    action: "tasks:create",
    resource: "tasks",
    userId: 2,
  });
  
  // User can create orders
  console.log("\nUSER Role:");
  checkAccess({
    role: "USER",
    action: "orders:create",
    resource: "orders",
    userId: 3,
  });
  checkAccess({
    role: "USER",
    action: "orders:read",
    resource: "orders",
    isOwner: true,
    userId: 3,
  });
  checkAccess({
    role: "USER",
    action: "artifacts:read",
    resource: "artifacts",
    userId: 3,
  });
  
  // Guest can read public content
  console.log("\nGUEST Role:");
  checkAccess({
    role: "GUEST",
    action: "artifacts:read",
    resource: "artifacts",
  });
  checkAccess({
    role: "GUEST",
    action: "projects:read",
    resource: "projects",
  });
}

/* =========================
   Test 3: DENIED Actions
   ========================= */

function testDeniedActions() {
  console.log("\n\n❌ TEST 3: DENIED Actions\n");
  
  // Guest cannot create anything
  console.log("GUEST Role (should be denied):");
  checkAccess({
    role: "GUEST",
    action: "artifacts:create",
    resource: "artifacts",
    reason: "Guest users cannot create content",
  });
  checkAccess({
    role: "GUEST",
    action: "orders:create",
    resource: "orders",
    reason: "Guest users must login to place orders",
  });
  
  // User cannot delete artifacts
  console.log("\nUSER Role (should be denied):");
  checkAccess({
    role: "USER",
    action: "artifacts:delete",
    resource: "artifacts",
    reason: "Only artifact owners or admins can delete",
  });
  checkAccess({
    role: "USER",
    action: "users:update",
    resource: "users",
    isOwner: false,
    reason: "Cannot update other users' profiles",
  });
  
  // Artist cannot access admin functions
  console.log("\nARTIST Role (should be denied):");
  checkAccess({
    role: "ARTIST",
    action: "users:delete",
    resource: "users",
    reason: "Only admins can delete users",
  });
  checkAccess({
    role: "ARTIST",
    action: "analytics:read",
    resource: "analytics",
    isOwner: false,
    reason: "Can only view own analytics",
  });
}

/* =========================
   Test 4: Ownership-Based Access
   ========================= */

function testOwnershipAccess() {
  console.log("\n\n🔑 TEST 4: Ownership-Based Access Control\n");
  
  console.log("ARTIST updating their OWN artifact:");
  checkAccess({
    role: "ARTIST",
    action: "artifacts:update",
    resource: "artifacts",
    isOwner: true,
    userId: 5,
    metadata: { artifactId: 123, sellerId: 5 },
  });
  
  console.log("\nARTIST trying to update SOMEONE ELSE'S artifact:");
  checkAccess({
    role: "ARTIST",
    action: "artifacts:update",
    resource: "artifacts",
    isOwner: false,
    userId: 5,
    reason: "Not the owner of this artifact",
    metadata: { artifactId: 456, sellerId: 10 },
  });
  
  console.log("\nUSER accessing their OWN order:");
  checkAccess({
    role: "USER",
    action: "orders:read",
    resource: "orders",
    isOwner: true,
    userId: 8,
    metadata: { orderId: 789 },
  });
  
  console.log("\nUSER trying to access SOMEONE ELSE'S order:");
  checkAccess({
    role: "USER",
    action: "orders:read",
    resource: "orders",
    isOwner: false,
    userId: 8,
    reason: "Cannot view other users' orders",
    metadata: { orderId: 999 },
  });
}

/* =========================
   Test 5: CRUD Operations Matrix
   ========================= */

function testCRUDMatrix() {
  console.log("\n\n📊 TEST 5: CRUD Operations Matrix\n");
  
  const roles: AppRole[] = ["ADMIN", "ARTIST", "USER", "GUEST"];
  const operations = [
    { resource: "artifacts" as const, action: "create" as const },
    { resource: "artifacts" as const, action: "read" as const },
    { resource: "artifacts" as const, action: "update" as const },
    { resource: "artifacts" as const, action: "delete" as const },
  ];
  
  console.log("Artifacts Permissions:");
  console.log("Role      | Create | Read | Update (own) | Delete (own)");
  console.log("----------|--------|------|--------------|-------------");
  
  roles.forEach((role) => {
    const results = operations.map((op) =>
      canPerform(role, op.resource, op.action, op.action !== "read" && op.action !== "create")
    );
    const [create, read, update, del] = results;
    console.log(
      `${role.padEnd(9)} | ${create ? "✅" : "❌"}    | ${read ? "✅" : "❌"}   | ${update ? "✅" : "❌"}          | ${del ? "✅" : "❌"}`
    );
  });
}

/* =========================
   Test 6: Audit Statistics
   ========================= */

function testAuditStatistics() {
  console.log("\n\n📈 TEST 6: Audit Statistics\n");
  
  const stats = getAuditStats();
  
  console.log(`Total Access Checks: ${stats.total}`);
  console.log(`Allowed: ${stats.allowed} (${((stats.allowed / stats.total) * 100).toFixed(1)}%)`);
  console.log(`Denied: ${stats.denied} (${((stats.denied / stats.total) * 100).toFixed(1)}%)`);
  
  console.log("\nBy Role:");
  Object.entries(stats.byRole).forEach(([role, counts]) => {
    const total = counts.allowed + counts.denied;
    console.log(
      `  ${role}: ${counts.allowed} allowed, ${counts.denied} denied (${total} total)`
    );
  });
}

/* =========================
   Run All Tests
   ========================= */

export function runRBACTests() {
  testRolePermissions();
  testAllowedActions();
  testDeniedActions();
  testOwnershipAccess();
  testCRUDMatrix();
  testAuditStatistics();
  
  console.log("\n" + "=".repeat(60));
  console.log("✨ All RBAC tests completed!");
  console.log("=".repeat(60) + "\n");
}

// Auto-run if executed directly
if (require.main === module) {
  runRBACTests();
}
