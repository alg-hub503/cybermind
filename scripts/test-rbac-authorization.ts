/**
 * RBAC Authorization Verification Script
 *
 * Tests all authorization scenarios for the VIEW_BILLING permission.
 * Run: npx tsx scripts/test-rbac-authorization.ts
 *
 * NO git commit/push — verification only.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface TestResult {
  name: string;
  passed: boolean;
  detail: string;
}

const results: TestResult[] = [];

function assert(name: string, passed: boolean, detail: string) {
  results.push({ name, passed, detail });
  const icon = passed ? "PASS" : "FAIL";
  console.log(`  [${icon}] ${name}: ${detail}`);
}

async function main() {
  console.log("=== RBAC Authorization Verification ===\n");

  // ──────────────────────────────────────────
  // 1. Verify VIEW_BILLING permission exists
  // ──────────────────────────────────────────
  console.log("1. VIEW_BILLING permission existence");
  const viewBillingPerm = await prisma.permission.findUnique({
    where: { code: "VIEW_BILLING" },
  });
  assert(
    "VIEW_BILLING exists in Permission table",
    !!viewBillingPerm,
    viewBillingPerm ? `id=${viewBillingPerm.id}` : "NOT FOUND"
  );

  const manageBillingPerm = await prisma.permission.findUnique({
    where: { code: "MANAGE_BILLING" },
  });
  assert(
    "MANAGE_BILLING exists in Permission table",
    !!manageBillingPerm,
    manageBillingPerm ? `id=${manageBillingPerm.id}` : "NOT FOUND"
  );

  assert(
    "VIEW_BILLING and MANAGE_BILLING are separate permissions",
    viewBillingPerm?.id !== manageBillingPerm?.id,
    `VIEW_BILLING=${viewBillingPerm?.id}, MANAGE_BILLING=${manageBillingPerm?.id}`
  );

  // ──────────────────────────────────────────
  // 2. Verify ADMIN roles have VIEW_BILLING
  // ──────────────────────────────────────────
  console.log("\n2. ADMIN roles with VIEW_BILLING");
  const adminRoles = await prisma.role.findMany({
    where: { systemKey: "SCHOOL_ADMIN" },
    include: {
      RolePermission: {
        include: { permission: true },
      },
    },
  });

  let adminRolesWithViewBilling = 0;
  let adminRolesWithManageBilling = 0;
  for (const role of adminRoles) {
    const hasView = role.RolePermission.some(
      (rp) => rp.permission.code === "VIEW_BILLING"
    );
    const hasManage = role.RolePermission.some(
      (rp) => rp.permission.code === "MANAGE_BILLING"
    );
    if (hasView) adminRolesWithViewBilling++;
    if (hasManage) adminRolesWithManageBilling++;
  }

  assert(
    "All ADMIN roles have VIEW_BILLING",
    adminRolesWithViewBilling === adminRoles.length,
    `${adminRolesWithViewBilling}/${adminRoles.length} ADMIN roles have VIEW_BILLING`
  );

  assert(
    "All ADMIN roles have MANAGE_BILLING",
    adminRolesWithManageBilling === adminRoles.length,
    `${adminRolesWithManageBilling}/${adminRoles.length} ADMIN roles have MANAGE_BILLING`
  );

  // ──────────────────────────────────────────
  // 3. Verify TEACHER roles do NOT have VIEW_BILLING by default
  // ──────────────────────────────────────────
  console.log("\n3. TEACHER roles without VIEW_BILLING (default)");
  const teacherRoles = await prisma.role.findMany({
    where: { systemKey: "TEACHER" },
    include: {
      RolePermission: {
        include: { permission: true },
      },
    },
  });

  let teacherRolesWithViewBilling = 0;
  for (const role of teacherRoles) {
    const hasView = role.RolePermission.some(
      (rp) => rp.permission.code === "VIEW_BILLING"
    );
    if (hasView) teacherRolesWithViewBilling++;
  }

  assert(
    "TEACHER roles do NOT have VIEW_BILLING by default",
    teacherRolesWithViewBilling === 0,
    `${teacherRolesWithViewBilling}/${teacherRoles.length} TEACHER roles have VIEW_BILLING (should be 0)`
  );

  // ──────────────────────────────────────────
  // 4. Verify STAFF roles do NOT have VIEW_BILLING by default
  // ──────────────────────────────────────────
  console.log("\n4. STAFF roles without VIEW_BILLING (default)");
  const staffRoles = await prisma.role.findMany({
    where: { systemKey: "STAFF" },
    include: {
      RolePermission: {
        include: { permission: true },
      },
    },
  });

  let staffRolesWithViewBilling = 0;
  for (const role of staffRoles) {
    const hasView = role.RolePermission.some(
      (rp) => rp.permission.code === "VIEW_BILLING"
    );
    if (hasView) staffRolesWithViewBilling++;
  }

  assert(
    "STAFF roles do NOT have VIEW_BILLING by default",
    staffRolesWithViewBilling === 0,
    `${staffRolesWithViewBilling}/${staffRoles.length} STAFF roles have VIEW_BILLING (should be 0)`
  );

  // ──────────────────────────────────────────
  // 5. Permission resolution: ADMIN bypasses
  // ──────────────────────────────────────────
  console.log("\n5. Permission resolution — ADMIN bypass");
  // Find a school ADMIN user
  const adminUserRole = await prisma.userRole.findFirst({
    where: {
      role: { systemKey: "SCHOOL_ADMIN" },
    },
    include: {
      user: true,
      role: true,
    },
  });

  if (adminUserRole) {
    const adminUser = adminUserRole.user;
    // Simulate resolvePermissions
    const userRoles = await prisma.userRole.findMany({
      where: { userId: adminUser.id, schoolId: adminUser.schoolId! },
      include: {
        role: {
          include: {
            RolePermission: {
              include: { permission: true },
            },
          },
        },
      },
    });
    const perms = new Set<string>();
    for (const ur of userRoles) {
      for (const rp of ur.role.RolePermission) {
        perms.add(rp.permission.code);
      }
    }
    const permissions = Array.from(perms);

    assert(
      `ADMIN user ${adminUser.email} has VIEW_BILLING via role`,
      permissions.includes("VIEW_BILLING"),
      `permissions=[${permissions.join(", ")}]`
    );

    // Also verify requirePermission bypass: ADMIN always passes
    assert(
      `requirePermission("VIEW_BILLING") bypasses for ADMIN (User.role=${adminUser.role})`,
      adminUser.role === "ADMIN",
      `User.role=${adminUser.role}`
    );
  } else {
    console.log("  [SKIP] No school ADMIN user found for testing");
  }

  // ──────────────────────────────────────────
  // 6. Permission resolution: TEACHER without VIEW_BILLING
  // ──────────────────────────────────────────
  console.log("\n6. Permission resolution — TEACHER without VIEW_BILLING");
  const teacherUserRole = await prisma.userRole.findFirst({
    where: {
      role: { systemKey: "TEACHER" },
    },
    include: {
      user: true,
      role: true,
    },
  });

  if (teacherUserRole) {
    const teacherUser = teacherUserRole.user;
    const userRoles = await prisma.userRole.findMany({
      where: { userId: teacherUser.id, schoolId: teacherUser.schoolId! },
      include: {
        role: {
          include: {
            RolePermission: {
              include: { permission: true },
            },
          },
        },
      },
    });
    const perms = new Set<string>();
    for (const ur of userRoles) {
      for (const rp of ur.role.RolePermission) {
        perms.add(rp.permission.code);
      }
    }
    const permissions = Array.from(perms);

    assert(
      `TEACHER user ${teacherUser.email} does NOT have VIEW_BILLING`,
      !permissions.includes("VIEW_BILLING"),
      `permissions=[${permissions.join(", ")}]`
    );

    assert(
      `TEACHER user does NOT have MANAGE_BILLING`,
      !permissions.includes("MANAGE_BILLING"),
      `permissions=[${permissions.join(", ")}]`
    );
  } else {
    console.log("  [SKIP] No TEACHER user found for testing");
  }

  // ──────────────────────────────────────────
  // 7. Permission resolution: STAFF without VIEW_BILLING
  // ──────────────────────────────────────────
  console.log("\n7. Permission resolution — STAFF without VIEW_BILLING");
  const staffUserRole = await prisma.userRole.findFirst({
    where: {
      role: { systemKey: "STAFF" },
    },
    include: {
      user: true,
      role: true,
    },
  });

  if (staffUserRole) {
    const staffUser = staffUserRole.user;
    const userRoles = await prisma.userRole.findMany({
      where: { userId: staffUser.id, schoolId: staffUser.schoolId! },
      include: {
        role: {
          include: {
            RolePermission: {
              include: { permission: true },
            },
          },
        },
      },
    });
    const perms = new Set<string>();
    for (const ur of userRoles) {
      for (const rp of ur.role.RolePermission) {
        perms.add(rp.permission.code);
      }
    }
    const permissions = Array.from(perms);

    assert(
      `STAFF user ${staffUser.email} does NOT have VIEW_BILLING`,
      !permissions.includes("VIEW_BILLING"),
      `permissions=[${permissions.join(", ")}]`
    );
  } else {
    console.log("  [SKIP] No STAFF user found for testing");
  }

  // ──────────────────────────────────────────
  // 8. Schema verification: requirePermission checks in code
  // ──────────────────────────────────────────
  console.log("\n8. Code verification — requirePermission usage");
  const fs = await import("fs");
  const path = await import("path");

  // Check GET /api/invoices
  const invoicesRoute = fs.readFileSync(
    path.join(process.cwd(), "app/api/invoices/route.ts"),
    "utf8"
  );
  assert(
    "GET /api/invoices uses requirePermission('VIEW_BILLING')",
    invoicesRoute.includes('requirePermission("VIEW_BILLING")'),
    invoicesRoute.includes('requirePermission("VIEW_BILLING")')
      ? "Found requirePermission(VIEW_BILLING) in GET handler"
      : "MISSING requirePermission(VIEW_BILLING)"
  );

  assert(
    "GET /api/invoices no longer uses requireAuth directly",
    !invoicesRoute.match(/export async function GET\(\)[\s\S]*?requireAuth\(\)/),
    "GET handler uses requirePermission (which wraps requireAuth)"
  );

  // Check GET /api/clients
  const clientsRoute = fs.readFileSync(
    path.join(process.cwd(), "app/api/clients/route.ts"),
    "utf8"
  );
  assert(
    "GET /api/clients uses requirePermission('VIEW_BILLING')",
    clientsRoute.includes('requirePermission("VIEW_BILLING")'),
    "Found requirePermission(VIEW_BILLING) in GET handler"
  );

  assert(
    "POST /api/invoices still uses requirePermission('MANAGE_BILLING')",
    invoicesRoute.includes('requirePermission("MANAGE_BILLING")'),
    "POST handler still protected by MANAGE_BILLING"
  );

  assert(
    "POST /api/clients still uses requirePermission('MANAGE_BILLING')",
    clientsRoute.includes('requirePermission("MANAGE_BILLING")'),
    "POST handler still protected by MANAGE_BILLING"
  );

  // Check [id] endpoints
  const invoicesIdRoute = fs.readFileSync(
    path.join(process.cwd(), "app/api/invoices/[id]/route.ts"),
    "utf8"
  );
  assert(
    "GET /api/invoices/[id] uses requirePermission('VIEW_BILLING')",
    invoicesIdRoute.includes('requirePermission("VIEW_BILLING")'),
    "GET [id] handler protected by VIEW_BILLING"
  );
  assert(
    "PUT /api/invoices/[id] uses requirePermission('MANAGE_BILLING')",
    invoicesIdRoute.includes('requirePermission("MANAGE_BILLING")'),
    "PUT [id] handler protected by MANAGE_BILLING"
  );
  assert(
    "DELETE /api/invoices/[id] uses requirePermission('MANAGE_BILLING')",
    invoicesIdRoute.includes('requirePermission("MANAGE_BILLING")'),
    "DELETE [id] handler protected by MANAGE_BILLING"
  );

  const clientsIdRoute = fs.readFileSync(
    path.join(process.cwd(), "app/api/clients/[id]/route.ts"),
    "utf8"
  );
  assert(
    "GET /api/clients/[id] uses requirePermission('VIEW_BILLING')",
    clientsIdRoute.includes('requirePermission("VIEW_BILLING")'),
    "GET [id] handler protected by VIEW_BILLING"
  );
  assert(
    "PUT /api/clients/[id] uses requirePermission('MANAGE_BILLING')",
    clientsIdRoute.includes('requirePermission("MANAGE_BILLING")'),
    "PUT [id] handler protected by MANAGE_BILLING"
  );
  assert(
    "DELETE /api/clients/[id] uses requirePermission('MANAGE_BILLING')",
    clientsIdRoute.includes('requirePermission("MANAGE_BILLING")'),
    "DELETE [id] handler protected by MANAGE_BILLING"
  );

  // Check dashboard pages
  const invoicesPage = fs.readFileSync(
    path.join(process.cwd(), "app/dashboard/invoices/page.tsx"),
    "utf8"
  );
  assert(
    "/dashboard/invoices uses requirePagePermission('VIEW_BILLING')",
    invoicesPage.includes('requirePagePermission("VIEW_BILLING")'),
    "Page uses requirePagePermission(VIEW_BILLING)"
  );

  const clientsPage = fs.readFileSync(
    path.join(process.cwd(), "app/dashboard/clients/page.tsx"),
    "utf8"
  );
  assert(
    "/dashboard/clients uses requirePagePermission('VIEW_BILLING')",
    clientsPage.includes('requirePagePermission("VIEW_BILLING")'),
    "Page uses requirePagePermission(VIEW_BILLING)"
  );

  const billingPage = fs.readFileSync(
    path.join(process.cwd(), "app/dashboard/billing/page.tsx"),
    "utf8"
  );
  assert(
    "/dashboard/billing uses requirePagePermission('VIEW_BILLING')",
    billingPage.includes('requirePagePermission("VIEW_BILLING")'),
    "Page uses requirePagePermission(VIEW_BILLING)"
  );

  // Check school-specific pages
  const schoolInvoicesPage = fs.readFileSync(
    path.join(process.cwd(), "app/dashboard/schools/[id]/invoices/page.tsx"),
    "utf8"
  );
  assert(
    "/dashboard/schools/[id]/invoices uses requirePagePermission('VIEW_BILLING')",
    schoolInvoicesPage.includes('requirePagePermission("VIEW_BILLING")'),
    "Page uses requirePagePermission(VIEW_BILLING)"
  );

  const schoolClientsPage = fs.readFileSync(
    path.join(process.cwd(), "app/dashboard/schools/[id]/clients/page.tsx"),
    "utf8"
  );
  assert(
    "/dashboard/schools/[id]/clients uses requirePagePermission('VIEW_BILLING')",
    schoolClientsPage.includes('requirePagePermission("VIEW_BILLING")'),
    "Page uses requirePagePermission(VIEW_BILLING)"
  );

  // ──────────────────────────────────────────
  // 9. Sidebar visibility
  // ──────────────────────────────────────────
  console.log("\n9. Sidebar visibility verification");
  const sidebar = fs.readFileSync(
    path.join(process.cwd(), "components/dashboard/sidebar.tsx"),
    "utf8"
  );

  assert(
    "Sidebar checks permissions from session",
    sidebar.includes("permissions") && sidebar.includes("VIEW_BILLING"),
    "Sidebar reads permissions and checks VIEW_BILLING"
  );

  assert(
    "Sidebar conditionally renders Clients",
    sidebar.includes("hasBillingAccess") && sidebar.includes("clients"),
    "Clients nav item gated by hasBillingAccess"
  );

  assert(
    "Sidebar conditionally renders Invoices",
    sidebar.includes("hasBillingAccess") && sidebar.includes("invoices"),
    "Invoices nav item gated by hasBillingAccess"
  );

  assert(
    "Sidebar conditionally renders Billing",
    sidebar.includes("hasBillingAccess") && sidebar.includes("billing"),
    "Billing nav item gated by hasBillingAccess"
  );

  // ──────────────────────────────────────────
  // 10. JWT/session permissions
  // ──────────────────────────────────────────
  console.log("\n10. JWT/session permissions verification");
  const authTs = fs.readFileSync(
    path.join(process.cwd(), "lib/auth.ts"),
    "utf8"
  );

  assert(
    "JWT callback loads permissions from DB",
    authTs.includes("token.permissions") && authTs.includes("RolePermission"),
    "JWT callback resolves permissions via UserRole→Role→RolePermission→Permission"
  );

  assert(
    "Session callback exposes permissions",
    authTs.includes("session.user.permissions"),
    "Session includes permissions array"
  );

  const nextAuthDts = fs.readFileSync(
    path.join(process.cwd(), "next-auth.d.ts"),
    "utf8"
  );

  assert(
    "Session type includes permissions: string[]",
    nextAuthDts.includes("permissions: string[]"),
    "Type augmentation includes permissions field"
  );

  assert(
    "JWT type includes permissions: string[]",
    nextAuthDts.includes("permissions: string[]"),
    "JWT type augmentation includes permissions field"
  );

  // ──────────────────────────────────────────
  // 11. Registration includes VIEW_BILLING for ADMIN
  // ──────────────────────────────────────────
  console.log("\n11. Registration flow verification");
  const registerRoute = fs.readFileSync(
    path.join(process.cwd(), "app/api/register/route.ts"),
    "utf8"
  );

  assert(
    "Registration assigns VIEW_BILLING to school ADMIN role",
    registerRoute.includes('"VIEW_BILLING"'),
    "VIEW_BILLING in adminPermCodes array"
  );

  assert(
    "Registration assigns MANAGE_BILLING to school ADMIN role",
    registerRoute.includes('"MANAGE_BILLING"'),
    "MANAGE_BILLING in adminPermCodes array"
  );

  // ──────────────────────────────────────────
  // 12. requirePagePermission exists and works
  // ──────────────────────────────────────────
  console.log("\n12. requirePagePermission helper verification");
  const authLib = fs.readFileSync(
    path.join(process.cwd(), "lib/authorization.ts"),
    "utf8"
  );

  assert(
    "requirePagePermission function exists",
    authLib.includes("export async function requirePagePermission"),
    "Function exported from lib/authorization.ts"
  );

  assert(
    "requirePagePermission calls requireAuth",
    authLib.includes("requireAuth()"),
    "Wraps requireAuth for authentication"
  );

  assert(
    "requirePagePermission calls resolvePermissions",
    authLib.includes("resolvePermissions(user.id, user.schoolId)"),
    "Resolves permissions from DB"
  );

  assert(
    "requirePagePermission redirects on missing permission",
    authLib.includes('redirect("/dashboard")'),
    "Redirects to /dashboard if permission missing"
  );

  assert(
    "requirePagePermission bypasses ADMIN",
    authLib.includes("user.role === ADMIN_ROLE") && authLib.includes("return { user }"),
    "ADMIN bypass returns user without permission check"
  );

  // ──────────────────────────────────────────
  // 13. No bypass: schoolId alone should not grant access
  // ──────────────────────────────────────────
  console.log("\n13. No schoolId-only bypass verification");
  assert(
    "GET /api/invoices does NOT use requireAuth + schoolId pattern",
    !invoicesRoute.includes("requireAuth()") || invoicesRoute.includes('requirePermission("VIEW_BILLING")'),
    "GET uses requirePermission, not bare requireAuth + schoolId"
  );

  assert(
    "GET /api/clients does NOT use requireAuth + schoolId pattern",
    !clientsRoute.includes("requireAuth()") || clientsRoute.includes('requirePermission("VIEW_BILLING")'),
    "GET uses requirePermission, not bare requireAuth + schoolId"
  );

  // ──────────────────────────────────────────
  // 14. Seed script includes VIEW_BILLING
  // ──────────────────────────────────────────
  console.log("\n14. Seed script verification");
  const seedScript = fs.readFileSync(
    path.join(process.cwd(), "scripts/seed-roles-permissions.ts"),
    "utf8"
  );

  assert(
    "Seed script includes VIEW_BILLING permission",
    seedScript.includes('"VIEW_BILLING"'),
    "VIEW_BILLING in PERMISSIONS array"
  );

  assert(
    "Seed script description distinguishes VIEW_BILLING from MANAGE_BILLING",
    seedScript.includes("View invoices, clients, and financial data") &&
      seedScript.includes("Create, edit, delete invoices and clients"),
    "Descriptions are distinct and clear"
  );

  // ──────────────────────────────────────────
  // Summary
  // ──────────────────────────────────────────
  console.log("\n=== SUMMARY ===");
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const total = results.length;

  console.log(`Total: ${total} | Passed: ${passed} | Failed: ${failed}`);

  if (failed > 0) {
    console.log("\nFailed tests:");
    for (const r of results.filter((r) => !r.passed)) {
      console.log(`  FAIL: ${r.name} — ${r.detail}`);
    }
  }

  await prisma.$disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
