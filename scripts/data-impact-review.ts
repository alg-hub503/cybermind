import { PrismaClient } from "@prisma/client";

// Use raw queries since schema has schoolId but DB doesn't yet
const prisma = new PrismaClient();

async function main() {
  console.log("=== DATA IMPACT REVIEW ===\n");

  // 1. Schools
  const schools = await prisma.$queryRaw`SELECT id, name FROM "School"`;
  console.log(`1. SCHOOLS: ${(schools as any[]).length} total`);
  for (const s of schools as any[]) {
    console.log(`   - ${s.name} (${s.id})`);
  }

  // 2. Current Roles
  const roles = await prisma.$queryRaw`SELECT id, name, "isDefault", "createdAt" FROM "Role" ORDER BY name`;
  console.log(`\n2. ROLES: ${(roles as any[]).length} total`);
  for (const r of roles as any[]) {
    console.log(`   - ${r.name} (id=${r.id}, isDefault=${r.isDefault})`);
  }

  // 3. RolePermission assignments
  const rolePerms = await prisma.$queryRaw`
    SELECT r.name as role_name, p.code as perm_code 
    FROM "RolePermission" rp
    JOIN "Role" r ON r.id = rp."roleId"
    JOIN "Permission" p ON p.id = rp."permissionId"
    ORDER BY r.name, p.code
  `;
  console.log(`\n3. ROLE_PERMISSION ASSIGNMENTS: ${(rolePerms as any[]).length} total`);
  for (const rp of rolePerms as any[]) {
    console.log(`   - ${rp.role_name} → ${rp.perm_code}`);
  }

  // 4. UserRole assignments
  const userRoles = await prisma.$queryRaw`
    SELECT u.email, r.name as role_name, s.name as school_name, ur."schoolId"
    FROM "UserRole" ur
    JOIN "User" u ON u.id = ur."userId"
    JOIN "Role" r ON r.id = ur."roleId"
    JOIN "School" s ON s.id = ur."schoolId"
    ORDER BY s.name, u.email
  `;
  console.log(`\n4. USER_ROLE ASSIGNMENTS: ${(userRoles as any[]).length} total`);
  for (const ur of userRoles as any[]) {
    console.log(`   - ${ur.email} → ${ur.role_name} @ ${ur.school_name} (schoolId=${ur.schoolId})`);
  }

  // 5. Users with role = ADMIN
  const adminUsers = await prisma.$queryRaw`SELECT id, email, name, role, "schoolId" FROM "User" WHERE role = 'ADMIN'`;
  console.log(`\n5. USERS WITH User.role = "ADMIN": ${(adminUsers as any[]).length} total`);
  for (const u of adminUsers as any[]) {
    console.log(`   - ${u.email} (id=${u.id}, schoolId=${u.schoolId})`);
  }

  // 6. All users grouped by role
  const allUsers = await prisma.$queryRaw`SELECT id, email, role, "schoolId" FROM "User" ORDER BY role, email`;
  console.log(`\n6. ALL USERS: ${(allUsers as any[]).length} total`);
  const grouped: Record<string, any[]> = {};
  for (const u of allUsers as any[]) {
    if (!grouped[u.role]) grouped[u.role] = [];
    grouped[u.role].push(u);
  }
  for (const [role, users] of Object.entries(grouped)) {
    console.log(`   ${role}: ${users.length} users`);
    for (const u of users) {
      console.log(`     - ${u.email} (schoolId=${u.schoolId})`);
    }
  }

  // 7. Users WITHOUT a school
  const noSchool = await prisma.$queryRaw`SELECT id, email, role FROM "User" WHERE "schoolId" IS NULL`;
  console.log(`\n7. USERS WITHOUT SCHOOL: ${(noSchool as any[]).length} total`);
  for (const u of noSchool as any[]) {
    console.log(`   - ${u.email} (role=${u.role})`);
  }

  // 8. Permission catalog
  const perms = await prisma.$queryRaw`SELECT code, description FROM "Permission" ORDER BY code`;
  console.log(`\n8. PERMISSION CATALOG: ${(perms as any[]).length} total`);
  for (const p of perms as any[]) {
    console.log(`   - ${p.code}: ${p.description}`);
  }

  // 9. Migrations
  const migrations = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "_prisma_migrations" WHERE "applied_at" IS NOT NULL`;
  console.log(`\n9. MIGRATIONS APPLIED: ${(migrations as any[])[0]?.count}`);

  console.log("\n=== END DATA IMPACT REVIEW ===");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
