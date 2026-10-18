// Replicates app/api/register/route.ts's seeding logic (school, settings,
// the 3 default roles + their permissions, the owner, their SCHOOL_ADMIN
// UserRole) via direct Prisma calls — not through POST /api/register.
//
// Why: register()'s own $transaction has repeatedly timed out or been
// invalidated (P2024, P2028) when called over HTTP from these verification
// scripts, blocking unrelated feature checks on a pre-existing, already
//-documented issue (CHANGELOG.md tech debt: the register() transaction is
// close to Prisma's interactive-transaction limit). This file sidesteps
// that path for TEST SETUP ONLY — it does not fix or touch register()
// itself, and is not a substitute for testing register() directly (that's
// what security-regression.ts's own register()-calling sections are for).

import type { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function seedSchoolAndOwner(
  prisma: PrismaClient,
  email: string,
  password: string
): Promise<{ schoolId: string; ownerId: string }> {
  const hashedPassword = await bcrypt.hash(password, 12);

  const school = await prisma.school.create({
    data: { name: `${email.split("@")[0]} School` },
  });

  const platformSettings = await prisma.platformSettings.findUnique({
    where: { id: "singleton" },
  });
  const duration = platformSettings?.trialDurationDays ?? 14;
  const now = new Date();

  await prisma.schoolSettings.create({
    data: {
      schoolId: school.id,
      trialStart: now,
      trialEnd: new Date(now.getTime() + duration * 24 * 60 * 60 * 1000),
    },
  });

  const owner = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      schoolId: school.id,
      role: "USER",
    },
  });

  const defaultRoles = [
    { name: "ADMIN", systemKey: "SCHOOL_ADMIN", description: "School administrator with full access", isDefault: true, schoolId: school.id },
    { name: "TEACHER", systemKey: "TEACHER", description: "Teacher with student management access", isDefault: true, schoolId: school.id },
    { name: "STAFF", systemKey: "STAFF", description: "Staff member with limited access", isDefault: true, schoolId: school.id },
  ];

  const roleMap: Record<string, string> = {};
  for (const roleDef of defaultRoles) {
    const created = await prisma.role.create({ data: roleDef });
    roleMap[roleDef.name] = created.id;
  }

  const permissions = await prisma.permission.findMany();
  const permMap: Record<string, string> = {};
  for (const p of permissions) permMap[p.code] = p.id;

  const adminPermCodes = [
    "MANAGE_STUDENTS", "MANAGE_TEACHERS", "MANAGE_STAFF",
    "MANAGE_CLASSES", "MANAGE_GRADES", "MANAGE_ACADEMIC_YEARS",
    "VIEW_REPORTS", "MANAGE_SCHOOL_SETTINGS", "VIEW_BILLING", "MANAGE_BILLING",
  ];
  for (const code of adminPermCodes) {
    if (permMap[code]) {
      await prisma.rolePermission.create({ data: { roleId: roleMap["ADMIN"], permissionId: permMap[code] } });
    }
  }
  for (const code of ["MANAGE_STUDENTS", "VIEW_REPORTS"]) {
    if (permMap[code]) {
      await prisma.rolePermission.create({ data: { roleId: roleMap["TEACHER"], permissionId: permMap[code] } });
    }
  }
  for (const code of ["VIEW_REPORTS", "MANAGE_SCHOOL_SETTINGS"]) {
    if (permMap[code]) {
      await prisma.rolePermission.create({ data: { roleId: roleMap["STAFF"], permissionId: permMap[code] } });
    }
  }

  await prisma.userRole.create({
    data: { userId: owner.id, roleId: roleMap["ADMIN"], schoolId: school.id },
  });

  return { schoolId: school.id, ownerId: owner.id };
}
