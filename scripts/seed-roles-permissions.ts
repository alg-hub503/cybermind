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

async function main() {
  console.log("Seeding permissions...");

  for (const permission of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: permission.code },
      update: {},
      create: permission,
    });
  }

  console.log("Seed complete.");
  console.log(`  ${PERMISSIONS.length} permissions`);
  console.log("  Roles are now created per-school during registration");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
