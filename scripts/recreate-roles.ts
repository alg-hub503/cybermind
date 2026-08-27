import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: [
    "MANAGE_STUDENTS", "MANAGE_TEACHERS", "MANAGE_STAFF",
    "MANAGE_CLASSES", "MANAGE_GRADES", "MANAGE_ACADEMIC_YEARS",
    "VIEW_REPORTS", "MANAGE_SCHOOL_SETTINGS", "MANAGE_BILLING",
  ],
  TEACHER: ["MANAGE_STUDENTS", "VIEW_REPORTS"],
  STAFF: ["VIEW_REPORTS", "MANAGE_SCHOOL_SETTINGS"],
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  ADMIN: "School administrator with full access",
  TEACHER: "Teacher with student management access",
  STAFF: "Staff member with limited access",
};

async function main() {
  console.log("=== FIXING DATABASE ===\n");

  // Step 1: Drop old unique index on name
  console.log("Step 1: Drop old unique index on name...");
  try {
    await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "Role_name_key"`);
    console.log("   ✅ Done");
  } catch (e: any) {
    console.log(`   ⚠️  ${e.message?.substring(0, 60)}`);
  }

  // Step 2: Drop existing roles (they're incomplete - missing permissions)
  console.log("\nStep 2: Clean up existing roles...");
  await prisma.$executeRawUnsafe(`DELETE FROM "RolePermission"`);
  await prisma.$executeRawUnsafe(`DELETE FROM "UserRole"`);
  await prisma.$executeRawUnsafe(`DELETE FROM "Role"`);
  console.log("   ✅ Cleared all roles and assignments");

  // Step 3: Create roles for each school
  console.log("\nStep 3: Creating school-scoped roles...");

  const schools = await prisma.$queryRawUnsafe(`SELECT id, name FROM "School"`) as any[];

  // Get permission IDs
  const perms = await prisma.$queryRawUnsafe(`SELECT id, code FROM "Permission"`) as any[];
  const permMap: Record<string, string> = {};
  for (const p of perms) {
    permMap[p.code] = p.id;
  }

  for (const school of schools) {
    console.log(`\n   School: ${school.name} (${school.id})`);

    const roleMap: Record<string, string> = {};

    for (const [roleName, permCodes] of Object.entries(ROLE_PERMISSIONS)) {
      const result = await prisma.$queryRawUnsafe(
        `INSERT INTO "Role" (id, name, "systemKey", description, "isDefault", "schoolId", "createdAt", "updatedAt")
         VALUES (gen_random_uuid()::text, $1, $1, $2, true, $3, NOW(), NOW())
         RETURNING id`,
        roleName, ROLE_DESCRIPTIONS[roleName], school.id
      ) as any[];

      roleMap[roleName] = result[0].id;
      console.log(`     ✅ ${roleName} role`);

      // Assign permissions
      for (const code of permCodes) {
        if (permMap[code]) {
          await prisma.$executeRawUnsafe(
            `INSERT INTO "RolePermission" (id, "roleId", "permissionId") VALUES (gen_random_uuid()::text, $1, $2)`,
            result[0].id, permMap[code]
          );
        }
      }
      console.log(`        → ${permCodes.length} permissions`);
    }

    // Create UserRoles
    const users = await prisma.$queryRawUnsafe(
      `SELECT id, email, role FROM "User" WHERE "schoolId" = $1`,
      school.id
    ) as any[];

    for (const user of users) {
      const targetRole = user.role === "ADMIN" ? "ADMIN" : "TEACHER";
      await prisma.$executeRawUnsafe(
        `INSERT INTO "UserRole" (id, "userId", "roleId", "schoolId") VALUES (gen_random_uuid()::text, $1, $2, $3)`,
        user.id, roleMap[targetRole], school.id
      );
      console.log(`     👤 ${user.email} → ${targetRole}`);
    }
  }

  // Step 4: Make schoolId NOT NULL
  console.log("\nStep 4: Make schoolId NOT NULL...");
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Role" ALTER COLUMN "schoolId" SET NOT NULL`);
    console.log("   ✅ Done");
  } catch (e: any) {
    console.log(`   ⚠️  ${e.message?.substring(0, 80)}`);
  }

  // Step 5: Add index
  console.log("\nStep 5: Add index...");
  try {
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Role_schoolId_idx" ON "Role"("schoolId")`);
    console.log("   ✅ Done");
  } catch (e: any) {
    console.log(`   ⚠️  ${e.message?.substring(0, 60)}`);
  }

  // Final verification
  console.log("\n=== FINAL STATE ===\n");

  const finalRoles = await prisma.$queryRawUnsafe(
    `SELECT r.name, r."systemKey", r."schoolId",
      (SELECT COUNT(*) FROM "RolePermission" rp WHERE rp."roleId" = r.id) as perm_count
     FROM "Role" r ORDER BY r."schoolId", r.name`
  ) as any[];

  console.log("Roles:");
  for (const r of finalRoles) {
    console.log(`  ${r.name} (${r.systemKey}) @ ${r.schoolId} - ${r.perm_count} permissions`);
  }

  const finalURs = await prisma.$queryRawUnsafe(
    `SELECT u.email, r.name as role_name, s.name as school_name
     FROM "UserRole" ur
     JOIN "User" u ON u.id = ur."userId"
     JOIN "Role" r ON r.id = ur."roleId"
     JOIN "School" s ON s.id = ur."schoolId"
     ORDER BY s.name, u.email`
  ) as any[];

  console.log("\nUserRoles:");
  for (const ur of finalURs) {
    console.log(`  ${ur.email} → ${ur.role_name} @ ${ur.school_name}`);
  }

  console.log("\n=== DONE ===");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
