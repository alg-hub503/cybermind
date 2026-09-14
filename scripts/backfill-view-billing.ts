/**
 * Backfill VIEW_BILLING to every role that already has MANAGE_BILLING.
 *
 * This ensures no existing role loses read access to invoices/clients
 * after VIEW_BILLING becomes required for GET endpoints.
 *
 * Safe to run on production: uses upsert + findFirst (no deletes, no recreates).
 *
 * Run: npx tsx scripts/backfill-view-billing.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. Ensure VIEW_BILLING permission exists
  const viewBilling = await prisma.permission.upsert({
    where: { code: "VIEW_BILLING" },
    update: {},
    create: {
      code: "VIEW_BILLING",
      description: "View invoices, clients, and financial data",
    },
  });
  console.log(`VIEW_BILLING permission: ${viewBilling.id}`);

  // 2. Find the MANAGE_BILLING permission
  const manageBilling = await prisma.permission.findUnique({
    where: { code: "MANAGE_BILLING" },
  });
  if (!manageBilling) {
    console.log("MANAGE_BILLING permission not found — nothing to backfill.");
    return;
  }
  console.log(`MANAGE_BILLING permission: ${manageBilling.id}`);

  // 3. Find ALL roles that have MANAGE_BILLING via RolePermission
  const rolesWithManage = await prisma.rolePermission.findMany({
    where: { permissionId: manageBilling.id },
    include: { role: true },
  });
  console.log(`Found ${rolesWithManage.length} roles with MANAGE_BILLING`);

  // 4. For each, add VIEW_BILLING if not already present
  let added = 0;
  let alreadyHad = 0;
  for (const rp of rolesWithManage) {
    const existing = await prisma.rolePermission.findFirst({
      where: { roleId: rp.roleId, permissionId: viewBilling.id },
    });
    if (!existing) {
      await prisma.rolePermission.create({
        data: { roleId: rp.roleId, permissionId: viewBilling.id },
      });
      added++;
      console.log(`  + Added VIEW_BILLING to role "${rp.role.name}" (${rp.roleId}) [school: ${rp.role.schoolId}]`);
    } else {
      alreadyHad++;
    }
  }

  console.log(`\nBackfill complete: ${added} added, ${alreadyHad} already had VIEW_BILLING`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
