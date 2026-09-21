/**
 * READ-ONLY audit — makes NO changes to the database (only `findMany` reads).
 *
 * Answers, per school: can anyone actually administer it once permissions are
 * enforced? It matters because these routes/pages now check permissions:
 *   - /api/stripe/* ................ MANAGE_BILLING
 *   - school settings page + PUT ... MANAGE_SCHOOL_SETTINGS
 *   - school users page/header ..... a role whose systemKey is "SCHOOL_ADMIN"
 * Schools created before roles existed (or by scripts/recreate-roles.ts, which
 * used systemKey "ADMIN" and gave owners the TEACHER role) can be locked out.
 *
 * It also lists emails that are not lower-case / trimmed, and case-insensitive
 * duplicates, because login now normalizes emails.
 *
 * Run: npx tsx scripts/audit-school-owners.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const NEEDED = ["MANAGE_BILLING", "MANAGE_SCHOOL_SETTINGS"] as const;

async function main() {
  const [schools, users, userRoles] = await Promise.all([
    prisma.school.findMany({
      select: { id: true, name: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.user.findMany({
      select: { id: true, email: true, role: true, schoolId: true },
      orderBy: { id: "asc" }, // cuid ids are time-ordered, so this is roughly "oldest first"
    }),
    prisma.userRole.findMany({
      select: {
        userId: true,
        schoolId: true,
        role: {
          select: {
            name: true,
            systemKey: true,
            RolePermission: { select: { permission: { select: { code: true } } } },
          },
        },
      },
    }),
  ]);

  console.log(`Schools: ${schools.length}   Users: ${users.length}   UserRole rows: ${userRoles.length}\n`);

  let schoolsWithProblems = 0;

  for (const school of schools) {
    const members = users.filter((u) => u.schoolId === school.id);
    const roleRows = userRoles.filter((ur) => ur.schoolId === school.id);

    const permsByUser = new Map<string, Set<string>>();
    const roleNamesByUser = new Map<string, string[]>();
    for (const ur of roleRows) {
      const perms = permsByUser.get(ur.userId) ?? new Set<string>();
      for (const rp of ur.role.RolePermission) perms.add(rp.permission.code);
      permsByUser.set(ur.userId, perms);

      const names = roleNamesByUser.get(ur.userId) ?? [];
      names.push(`${ur.role.name}[${ur.role.systemKey ?? "-"}]`);
      roleNamesByUser.set(ur.userId, names);
    }

    const problems: string[] = [];

    const owner = members[0]; // oldest member (by id) = most likely the owner
    if (!owner) {
      problems.push("school has no users");
    }

    if (!roleRows.some((ur) => ur.role.systemKey === "SCHOOL_ADMIN")) {
      const legacy = roleRows.some((ur) => ur.role.systemKey === "ADMIN");
      problems.push(
        legacy
          ? 'nobody holds a "SCHOOL_ADMIN" role (found legacy systemKey "ADMIN" — requireSchoolAdmin() will not recognise it)'
          : 'nobody holds a "SCHOOL_ADMIN" role'
      );
    }

    for (const code of NEEDED) {
      const holders = members.filter((m) => permsByUser.get(m.id)?.has(code));
      if (holders.length === 0) {
        problems.push(`nobody in this school has ${code}`);
      }
    }

    const noRoles = members.filter((m) => m.role !== "ADMIN" && !roleNamesByUser.has(m.id));
    if (noRoles.length > 0) {
      problems.push(`${noRoles.length} user(s) have no UserRole (zero permissions)`);
    }

    if (problems.length > 0) {
      schoolsWithProblems++;
      console.log(`WARN  ${school.name}  (${school.id})  created ${school.createdAt.toISOString().slice(0, 10)}`);
      if (owner) {
        const names = roleNamesByUser.get(owner.id)?.join(", ") ?? "none";
        console.log(`      probable owner: ${owner.email}  User.role=${owner.role}  roles: ${names}`);
      }
      for (const p of problems) console.log(`      - ${p}`);
      console.log("");
    } else {
      console.log(`OK    ${school.name}  (${school.id})`);
    }
  }

  // ── Email hygiene ──────────────────────────────────────────────
  console.log("\n--- Email hygiene ---");
  const notNormalized = users.filter((u) => u.email !== u.email.trim().toLowerCase());
  console.log(`Emails not trimmed/lower-case: ${notNormalized.length}`);
  for (const u of notNormalized) console.log(`  ${JSON.stringify(u.email)}  (${u.id})`);

  const byLower = new Map<string, string[]>();
  for (const u of users) {
    const key = u.email.trim().toLowerCase();
    byLower.set(key, [...(byLower.get(key) ?? []), u.email]);
  }
  const duplicates = Array.from(byLower.entries()).filter(([, list]) => list.length > 1);
  console.log(`Case-insensitive duplicates: ${duplicates.length}`);
  for (const [key, list] of duplicates) console.log(`  ${key}: ${list.join(" | ")}`);

  console.log(
    `\nSummary: ${schoolsWithProblems} of ${schools.length} school(s) need attention before deploying the permission changes.`
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
