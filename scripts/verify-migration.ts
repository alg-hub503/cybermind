import { PrismaClient } from "@prisma/client";

interface IdRow {
  id: string;
}

interface NameRow {
  id: string;
  name: string;
}

interface OrphanRow {
  id: string;
  userId: string;
  roleId: string;
  schoolId: string;
}

interface CrossSchoolRow {
  id: string;
  ur_school: string;
  role_school: string;
}

interface CountRow {
  count: bigint;
}

const prisma = new PrismaClient();

async function main() {
  console.log("=== MIGRATION VERIFICATION ===\n");

  let errors = 0;

  console.log("1. Checking school roles...");
  const schools = await prisma.$queryRaw<NameRow[]>`SELECT id, name FROM "School"`;
  for (const school of schools) {
    const adminRole = await prisma.$queryRaw<IdRow[]>`
      SELECT id FROM "Role" WHERE "schoolId" = ${school.id} AND "systemKey" = 'SCHOOL_ADMIN'
    `;
    const teacherRole = await prisma.$queryRaw<IdRow[]>`
      SELECT id FROM "Role" WHERE "schoolId" = ${school.id} AND "systemKey" = 'TEACHER'
    `;
    const staffRole = await prisma.$queryRaw<IdRow[]>`
      SELECT id FROM "Role" WHERE "schoolId" = ${school.id} AND "systemKey" = 'STAFF'
    `;

    if (adminRole.length === 0) {
      console.log(`   ❌ ${school.name}: Missing SCHOOL_ADMIN role`);
      errors++;
    } else {
      console.log(`   ✅ ${school.name}: Has SCHOOL_ADMIN role`);
    }

    if (teacherRole.length === 0) {
      console.log(`   ❌ ${school.name}: Missing TEACHER role`);
      errors++;
    } else {
      console.log(`   ✅ ${school.name}: Has TEACHER role`);
    }

    if (staffRole.length === 0) {
      console.log(`   ❌ ${school.name}: Missing STAFF role`);
      errors++;
    } else {
      console.log(`   ✅ ${school.name}: Has STAFF role`);
    }
  }

  console.log("\n2. Checking for orphaned UserRoles...");
  const orphans = await prisma.$queryRaw<OrphanRow[]>`
    SELECT ur.id, ur."userId", ur."roleId", ur."schoolId"
    FROM "UserRole" ur
    LEFT JOIN "Role" r ON r.id = ur."roleId"
    WHERE r.id IS NULL
  `;
  if (orphans.length > 0) {
    console.log(`   ❌ Found ${orphans.length} orphaned UserRoles`);
    errors++;
  } else {
    console.log("   ✅ No orphaned UserRoles");
  }

  console.log("\n3. Checking for cross-school assignments...");
  const crossSchool = await prisma.$queryRaw<CrossSchoolRow[]>`
    SELECT ur.id, ur."schoolId" as ur_school, r."schoolId" as role_school
    FROM "UserRole" ur
    JOIN "Role" r ON r.id = ur."roleId"
    WHERE ur."schoolId" != r."schoolId"
  `;
  if (crossSchool.length > 0) {
    console.log(`   ❌ Found ${crossSchool.length} cross-school assignments`);
    errors++;
  } else {
    console.log("   ✅ No cross-school assignments");
  }

  console.log("\n4. Checking RolePermission counts...");
  const globalCount = await prisma.$queryRaw<CountRow[]>`
    SELECT COUNT(*) as count FROM "RolePermission" rp 
    JOIN "Role" r ON r.id = rp."roleId" 
    WHERE r."schoolId" IS NULL
  `;
  const schoolCount = await prisma.$queryRaw<CountRow[]>`
    SELECT COUNT(*) as count FROM "RolePermission" rp 
    JOIN "Role" r ON r.id = rp."roleId" 
    WHERE r."schoolId" IS NOT NULL
  `;
  console.log(`   Global role permissions: ${globalCount[0]?.count ?? 0}`);
  console.log(`   School role permissions: ${schoolCount[0]?.count ?? 0}`);

  console.log("\n5. Checking for remaining global roles...");
  const globalRoles = await prisma.$queryRaw<NameRow[]>`
    SELECT id, name FROM "Role" WHERE "schoolId" IS NULL
  `;
  if (globalRoles.length > 0) {
    console.log(`   ⚠️  ${globalRoles.length} global roles still exist`);
  } else {
    console.log("   ✅ No global roles remain");
  }

  console.log("\n=== VERIFICATION SUMMARY ===");
  if (errors > 0) {
    console.log(`❌ FAILED: ${errors} errors found`);
    process.exit(1);
  } else {
    console.log("✅ ALL CHECKS PASSED");
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e: unknown) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
