import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const STATEMENTS = [
  // Phase 1: Add columns
  `ALTER TABLE "Role" ADD COLUMN "systemKey" TEXT`,
  `ALTER TABLE "Role" ADD COLUMN "schoolId" TEXT`,

  // Phase 2: Drop old constraint
  `ALTER TABLE "Role" DROP CONSTRAINT "Role_name_key"`,

  // Phase 3: Add new constraints
  `ALTER TABLE "Role" ADD CONSTRAINT "Role_schoolId_name_key" UNIQUE ("schoolId", "name")`,
  `ALTER TABLE "Role" ADD CONSTRAINT "Role_schoolId_systemKey_key" UNIQUE ("schoolId", "systemKey")`,

  // Phase 4: Create school-scoped ADMIN roles
  `INSERT INTO "Role" (id, name, "systemKey", description, "isDefault", "schoolId", "createdAt", "updatedAt")
   SELECT gen_random_uuid()::text, 'ADMIN', 'SCHOOL_ADMIN', 'School administrator with full access', true, s.id, NOW(), NOW()
   FROM "School" s
   WHERE NOT EXISTS (SELECT 1 FROM "Role" r WHERE r."schoolId" = s.id AND r."systemKey" = 'SCHOOL_ADMIN')`,

  // Phase 4: Create school-scoped TEACHER roles
  `INSERT INTO "Role" (id, name, "systemKey", description, "isDefault", "schoolId", "createdAt", "updatedAt")
   SELECT gen_random_uuid()::text, 'TEACHER', 'TEACHER', 'Teacher with student management access', true, s.id, NOW(), NOW()
   FROM "School" s
   WHERE NOT EXISTS (SELECT 1 FROM "Role" r WHERE r."schoolId" = s.id AND r."systemKey" = 'TEACHER')`,

  // Phase 4: Create school-scoped STAFF roles
  `INSERT INTO "Role" (id, name, "systemKey", description, "isDefault", "schoolId", "createdAt", "updatedAt")
   SELECT gen_random_uuid()::text, 'STAFF', 'STAFF', 'Staff member with limited access', true, s.id, NOW(), NOW()
   FROM "School" s
   WHERE NOT EXISTS (SELECT 1 FROM "Role" r WHERE r."schoolId" = s.id AND r."systemKey" = 'STAFF')`,

  // Phase 5: Copy permissions from global to school roles
  `INSERT INTO "RolePermission" (id, "roleId", "permissionId")
   SELECT gen_random_uuid()::text, school_role.id, rp."permissionId"
   FROM "Role" global_role
   JOIN "RolePermission" rp ON rp."roleId" = global_role.id
   JOIN "Role" school_role ON school_role.name = global_role.name AND school_role."schoolId" IS NOT NULL
   WHERE global_role."schoolId" IS NULL
   AND NOT EXISTS (
     SELECT 1 FROM "RolePermission" existing
     WHERE existing."roleId" = school_role.id AND existing."permissionId" = rp."permissionId"
   )`,

  // Phase 6: Migrate UserRole references
  `UPDATE "UserRole" ur
   SET "roleId" = (
     SELECT sr.id FROM "Role" sr
     WHERE sr.name = (SELECT gr.name FROM "Role" gr WHERE gr.id = ur."roleId")
     AND sr."schoolId" = ur."schoolId"
     AND sr."schoolId" IS NOT NULL
     LIMIT 1
   )
   WHERE ur."roleId" IN (SELECT id FROM "Role" WHERE "schoolId" IS NULL)`,

  // Phase 7: Make schoolId NOT NULL
  `ALTER TABLE "Role" ALTER COLUMN "schoolId" SET NOT NULL`,

  // Phase 8: Delete global roles
  `DELETE FROM "RolePermission" WHERE "roleId" IN (SELECT id FROM "Role" WHERE "schoolId" IS NULL)`,
  `DELETE FROM "Role" WHERE "schoolId" IS NULL`,

  // Phase 9: Add index
  `CREATE INDEX "Role_schoolId_idx" ON "Role"("schoolId")`,
];

async function apply() {
  console.log("=== APPLYING MIGRATION ===\n");

  for (let i = 0; i < STATEMENTS.length; i++) {
    const stmt = STATEMENTS[i];
    const preview = stmt.substring(0, 80).replace(/\n/g, " ");
    process.stdout.write(`  [${i + 1}/${STATEMENTS.length}] ${preview}... `);
    try {
      await prisma.$executeRawUnsafe(stmt);
      console.log("✅");
    } catch (e: any) {
      const msg = e.message || "";
      if (msg.includes("already exists") || msg.includes("does not exist")) {
        console.log(`⚠️  ${msg.substring(0, 60)} (skipping)`);
      } else {
        console.log(`❌ ${msg.substring(0, 100)}`);
        throw e;
      }
    }
  }

  console.log("\n=== MIGRATION APPLIED ===");
}

async function verify() {
  console.log("\n=== MIGRATION VERIFICATION ===\n");

  let errors = 0;

  // 1. School roles
  console.log("1. Checking school roles...");
  const schools = await prisma.$queryRaw`SELECT id, name FROM "School"`;
  for (const school of schools as any[]) {
    for (const systemKey of ["SCHOOL_ADMIN", "TEACHER", "STAFF"]) {
      const count = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM "Role" WHERE "schoolId" = ${school.id} AND "systemKey" = ${systemKey}
      `;
      if ((count as any[])[0]?.count === 0) {
        console.log(`   ❌ ${school.name}: Missing ${systemKey} role`);
        errors++;
      } else {
        console.log(`   ✅ ${school.name}: Has ${systemKey} role`);
      }
    }
  }

  // 2. Orphaned UserRoles
  console.log("\n2. Checking for orphaned UserRoles...");
  const orphans = await prisma.$queryRaw`
    SELECT COUNT(*) as count FROM "UserRole" ur
    LEFT JOIN "Role" r ON r.id = ur."roleId"
    WHERE r.id IS NULL
  `;
  if ((orphans as any[])[0]?.count > 0) {
    console.log(`   ❌ ${(orphans as any[])[0].count} orphaned UserRoles`);
    errors++;
  } else {
    console.log("   ✅ No orphaned UserRoles");
  }

  // 3. Cross-school assignments
  console.log("\n3. Checking for cross-school assignments...");
  const crossSchool = await prisma.$queryRaw`
    SELECT COUNT(*) as count FROM "UserRole" ur
    JOIN "Role" r ON r.id = ur."roleId"
    WHERE ur."schoolId" != r."schoolId"
  `;
  if ((crossSchool as any[])[0]?.count > 0) {
    console.log(`   ❌ ${(crossSchool as any[])[0].count} cross-school assignments`);
    errors++;
  } else {
    console.log("   ✅ No cross-school assignments");
  }

  // 4. Global roles
  console.log("\n4. Checking for remaining global roles...");
  const globalRoles = await prisma.$queryRaw`
    SELECT COUNT(*) as count FROM "Role" WHERE "schoolId" IS NULL
  `;
  if ((globalRoles as any[])[0]?.count > 0) {
    console.log(`   ❌ ${(globalRoles as any[])[0].count} global roles remain`);
    errors++;
  } else {
    console.log("   ✅ No global roles remain");
  }

  // 5. schoolId NOT NULL
  console.log("\n5. Checking schoolId NOT NULL...");
  const nullCount = await prisma.$queryRaw`
    SELECT COUNT(*) as count FROM "Role" WHERE "schoolId" IS NULL
  `;
  if ((nullCount as any[])[0]?.count > 0) {
    console.log(`   ❌ ${(nullCount as any[])[0].count} roles with null schoolId`);
    errors++;
  } else {
    console.log("   ✅ All roles have schoolId");
  }

  // 6. Summary
  console.log("\n=== VERIFICATION SUMMARY ===");
  if (errors > 0) {
    console.log(`❌ FAILED: ${errors} errors found`);
    process.exit(1);
  } else {
    console.log("✅ ALL CHECKS PASSED");
  }
}

async function main() {
  const mode = process.argv[2] || "verify";
  if (mode === "apply") {
    await apply();
  }
  await verify();
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
