import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PERMISSIONS = [
  { code: "MANAGE_STUDENTS", description: "Create, edit, delete students" },
  { code: "MANAGE_TEACHERS", description: "Create, edit, deactivate teachers" },
  { code: "MANAGE_STAFF", description: "Create, edit, deactivate staff" },
  { code: "MANAGE_CLASSES", description: "Create, edit, delete classes" },
  { code: "MANAGE_GRADES", description: "Create, edit, delete grades" },
  { code: "MANAGE_ACADEMIC_YEARS", description: "Create, edit academic years" },
  { code: "VIEW_REPORTS", description: "View analytics and reports" },
  { code: "MANAGE_SCHOOL_SETTINGS", description: "Edit school settings" },
  { code: "MANAGE_BILLING", description: "View and manage billing" },
];

const DEFAULT_ROLES = [
  { name: "ADMIN", description: "School administrator with full access", isDefault: true },
  { name: "TEACHER", description: "Teacher with student management access", isDefault: true },
  { name: "STAFF", description: "Staff member with limited access", isDefault: true },
];

const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: [
    "MANAGE_STUDENTS",
    "MANAGE_TEACHERS",
    "MANAGE_STAFF",
    "MANAGE_CLASSES",
    "MANAGE_GRADES",
    "MANAGE_ACADEMIC_YEARS",
    "VIEW_REPORTS",
    "MANAGE_SCHOOL_SETTINGS",
    "MANAGE_BILLING",
  ],
  TEACHER: [
    "MANAGE_STUDENTS",
    "VIEW_REPORTS",
  ],
  STAFF: [
    "VIEW_REPORTS",
    "MANAGE_SCHOOL_SETTINGS",
  ],
};

async function main() {
  console.log("Seeding permissions...");

  for (const permission of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: permission.code },
      update: {},
      create: permission,
    });
  }

  console.log("Seeding roles...");

  for (const role of DEFAULT_ROLES) {
    const created = await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });

    const permissionCodes = ROLE_PERMISSIONS[role.name] ?? [];

    for (const code of permissionCodes) {
      const permission = await prisma.permission.findUnique({
        where: { code },
      });

      if (permission) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: created.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: created.id,
            permissionId: permission.id,
          },
        });
      }
    }
  }

  console.log("Seed complete.");
  console.log(`  ${PERMISSIONS.length} permissions`);
  console.log(`  ${DEFAULT_ROLES.length} roles`);
  console.log(`  ${Object.values(ROLE_PERMISSIONS).flat().length} role-permission assignments`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
