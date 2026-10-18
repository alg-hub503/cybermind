// Standalone, minimal verification of DELETE /api/schools/[id]/users/[userId].
// Skips sections 1-10 of security-regression.ts entirely (fewer requests,
// much less pressure on Neon's 5-connection pool) to isolate whether the
// delete feature itself works, independent of the full suite's flakiness.
// Run: npx tsx scripts/verify-delete-feature.ts

import { spawn, type ChildProcess } from "node:child_process";
import { PrismaClient } from "@prisma/client";
import { seedSchoolAndOwner } from "./lib/seed-test-school";
import { killProcessTree } from "./lib/kill-process-tree";

const BASE = "http://localhost:3000";
const TEST_EMAIL_DOMAIN = "test.local";
const PORT_READY_TIMEOUT_MS = 180_000;

type HttpResult = { status: number; body: unknown };

let server: ChildProcess | null = null;
const prisma = new PrismaClient();

let testCount = 0;
let passCount = 0;
let failCount = 0;
const log: string[] = [];
const devLog: string[] = [];

function heading(title: string) {
  log.push(`\n${"=".repeat(70)}\n  ${title}\n${"=".repeat(70)}`);
}
function subheading(title: string) {
  log.push(`\n  --- ${title}`);
}
function result(path: string, method: string, status: number, description: string, expected: number) {
  testCount++;
  if (status === expected) { passCount++; log.push(`  PASS ${method} ${path} -> ${status}  (${description})`); }
  else { failCount++; log.push(`  FAIL ${method} ${path} -> ${status} (expected ${expected})  (${description})`); }
}
function assert(condition: boolean, description: string) {
  testCount++;
  if (condition) { passCount++; log.push(`  PASS assertion: ${description}`); }
  else { failCount++; log.push(`  FAIL assertion: ${description}`); }
}

async function waitForServer(): Promise<boolean> {
  const deadline = Date.now() + PORT_READY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (server?.exitCode !== null && server?.exitCode !== undefined) return false;
    try { const res = await fetch(`${BASE}/api/auth/csrf`); if (res.ok) return true; } catch { /* not ready */ }
    await new Promise((r) => setTimeout(r, 2000));
  }
  return false;
}

function startDevServer(): ChildProcess {
  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
  const child = spawn(npmCmd, ["run", "dev"], { cwd: process.cwd(), stdio: ["ignore", "pipe", "pipe"], shell: process.platform === "win32" });
  child.stdout?.on("data", (d: Buffer) => devLog.push(d.toString().trimEnd()));
  child.stderr?.on("data", (d: Buffer) => devLog.push(d.toString().trimEnd()));
  return child;
}

async function login(email: string, password: string): Promise<string | null> {
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`, { redirect: "manual" });
  const rawCookies = csrfRes.headers.get("set-cookie") || "";
  const cookies: string[] = [];
  for (const c of rawCookies.split(/(?<!Expires=[^;]*),(?! )/)) cookies.push(c.split(";")[0].trim());
  const { csrfToken } = await csrfRes.json();
  if (!csrfToken) return null;
  const loginRes = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Cookie: cookies.join("; ") },
    body: new URLSearchParams({ email, password, csrfToken, callbackUrl: "/dashboard" }),
    redirect: "manual",
  });
  const setCookie = loginRes.headers.get("set-cookie");
  if (!setCookie) return null;
  for (const c of setCookie.split(/(?<!Expires=[^;]*),(?! )/)) {
    const m = c.match(/next-auth\.session-token=([^;]+)/);
    if (m) return `next-auth.session-token=${m[1]}`;
  }
  return null;
}

async function parseResponse(res: Response): Promise<HttpResult> {
  const ct = res.headers.get("content-type") || "";
  let body: unknown = null;
  if (ct.includes("application/json")) { try { body = await res.json(); } catch { body = null; } }
  else { body = await res.text(); }
  return { status: res.status, body };
}

async function authed(path: string, options: RequestInit = {}, cookie?: string): Promise<HttpResult> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...(options.headers as Record<string, string> | undefined), Cookie: cookie || "", "Content-Type": "application/json" },
    redirect: "manual",
  });
  return parseResponse(res);
}

async function main() {
  server = startDevServer();
  heading("Starting dev server");
  const ready = await waitForServer();
  if (!ready) {
    log.push("  FAIL dev server did not become ready");
    console.log(log.join("\n"));
    console.log("\n--- dev server output (tail) ---\n" + devLog.slice(-40).join("\n"));
    killProcessTree(server?.pid);
    process.exit(1);
  }
  log.push("  Dev server ready");

  const uid = `del${Date.now()}`;
  const password = "Pass123!";
  const emailA = `delv-a-${uid}@${TEST_EMAIL_DOMAIN}`;
  const emailB = `delv-b-${uid}@${TEST_EMAIL_DOMAIN}`;
  const adminEmail = `delv-admin-${uid}@${TEST_EMAIL_DOMAIN}`;

  heading("SETUP: two schools, their owners, a platform admin");

  const admin = await prisma.user.create({
    data: { email: adminEmail, password: await (await import("bcryptjs")).hash(password, 12), role: "ADMIN", schoolId: null },
  });

  // Seeded directly via Prisma, not through POST /api/register — see
  // scripts/lib/seed-test-school.ts for why.
  const { schoolId: sidA } = await seedSchoolAndOwner(prisma, emailA, password);
  const { schoolId: sidB } = await seedSchoolAndOwner(prisma, emailB, password);

  const cookieAdmin = await login(adminEmail, password);
  const cookieA = await login(emailA, password);
  const cookieB = await login(emailB, password);
  if (!cookieAdmin || !cookieA || !cookieB) throw new Error("login failed");

  const ownerA = await prisma.user.findUniqueOrThrow({ where: { email: emailA } });
  const ownerB = await prisma.user.findUniqueOrThrow({ where: { email: emailB } });
  const roleA_admin = await prisma.role.findFirstOrThrow({ where: { schoolId: sidA, systemKey: "SCHOOL_ADMIN" } });
  log.push(`  schools and owners ready (school A: ${sidA})`);

  const userRoute = (schoolId: string, userId: string) => `/api/schools/${schoolId}/users/${userId}`;
  let r: HttpResult;

  // ── Section 11 body, verbatim in spirit ──────────────────────
  heading("School user deletion (DELETE /api/schools/[id]/users/[userId])");

  subheading("Self-deletion rejection");
  r = await authed(userRoute(sidA, ownerA.id), { method: "DELETE" }, cookieA);
  result(userRoute(sidA, ownerA.id), "DELETE", r.status, "owner tries to delete themselves", 400);
  assert((await prisma.user.findUnique({ where: { id: ownerA.id } })) !== null, "owner A still exists after the blocked self-delete");

  subheading("Cross-school rejection");
  const memberForDelete = await prisma.user.create({ data: { email: `delv-target-${uid}@${TEST_EMAIL_DOMAIN}`, password: await (await import("bcryptjs")).hash(password, 12), role: "TEACHER", schoolId: sidA } });
  r = await authed(userRoute(sidA, ownerB.id), { method: "DELETE" }, cookieA);
  result(userRoute(sidA, ownerB.id), "DELETE", r.status, "school A admin targets school B's owner", 403);
  assert((await prisma.user.findUnique({ where: { id: ownerB.id } })) !== null, "school B's owner was not deleted");

  subheading("Tenant isolation: caller has no authority over this schoolId");
  r = await authed(userRoute(sidA, memberForDelete.id), { method: "DELETE" }, cookieB);
  result(userRoute(sidA, memberForDelete.id), "DELETE", r.status, "school B's owner is not an admin of school A", 403);

  subheading("Platform ADMIN accounts cannot be deleted from a school's user list");
  const strayPlatformAdmin = await prisma.user.create({ data: { email: `delv-stray-admin-${uid}@${TEST_EMAIL_DOMAIN}`, password: await (await import("bcryptjs")).hash(password, 12), role: "ADMIN", schoolId: sidA } });
  r = await authed(userRoute(sidA, strayPlatformAdmin.id), { method: "DELETE" }, cookieA);
  result(userRoute(sidA, strayPlatformAdmin.id), "DELETE", r.status, "a schoolId-bearing platform ADMIN cannot be deleted here", 403);
  await prisma.user.delete({ where: { id: strayPlatformAdmin.id } });

  subheading("Last SCHOOL_ADMIN protection on delete");
  await prisma.userRole.create({ data: { userId: memberForDelete.id, roleId: roleA_admin.id, schoolId: sidA } });
  r = await authed(userRoute(sidA, memberForDelete.id), { method: "DELETE" }, cookieAdmin);
  result(userRoute(sidA, memberForDelete.id), "DELETE", r.status, "deleting one of TWO admins succeeds", 200);
  assert((await prisma.userRole.count({ where: { schoolId: sidA, roleId: roleA_admin.id } })) === 1, "exactly one SCHOOL_ADMIN remains in school A (ownerA) after that delete");

  r = await authed(userRoute(sidA, ownerA.id), { method: "DELETE" }, cookieAdmin);
  result(userRoute(sidA, ownerA.id), "DELETE", r.status, "platform ADMIN blocked from deleting the LAST SCHOOL_ADMIN", 409);
  assert((await prisma.user.findUnique({ where: { id: ownerA.id } })) !== null, "school A's owner still exists after the blocked attempt");

  subheading("Successful delete cascades cleanly");
  const cascadeTestUser = await prisma.user.create({ data: { email: `delv-cascade-${uid}@${TEST_EMAIL_DOMAIN}`, password: await (await import("bcryptjs")).hash(password, 12), role: "TEACHER", schoolId: sidA } });
  await prisma.passwordResetToken.create({ data: { userId: cascadeTestUser.id, tokenHash: `delv-hash-${uid}`, expiresAt: new Date(Date.now() + 3600_000) } });
  r = await authed(userRoute(sidA, cascadeTestUser.id), { method: "DELETE" }, cookieA);
  result(userRoute(sidA, cascadeTestUser.id), "DELETE", r.status, "owner deletes a plain member with an existing reset token", 200);
  assert((await prisma.user.findUnique({ where: { id: cascadeTestUser.id } })) === null, "the user row is gone");
  assert((await prisma.passwordResetToken.count({ where: { userId: cascadeTestUser.id } })) === 0, "the cascade removed their password reset token too (no orphan row)");

  // ── Cleanup ──────────────────────────────────────────────────
  heading("Cleanup");
  const runUsers = await prisma.user.findMany({ where: { email: { contains: uid } }, select: { id: true, schoolId: true } });
  const runSchoolIds = Array.from(new Set([sidA, sidB, ...runUsers.map((u) => u.schoolId).filter((s): s is string => Boolean(s))]));
  await prisma.user.deleteMany({ where: { id: { in: [...runUsers.map((u) => u.id), admin.id] } } });
  await prisma.school.deleteMany({ where: { id: { in: runSchoolIds } } });
  await prisma.role.deleteMany({ where: { schoolId: { in: runSchoolIds } } });
  log.push("  Test data removed");

  heading(`RESULTS: ${passCount} passed, ${failCount} failed, ${testCount} total`);
  console.log(log.join("\n"));
  killProcessTree(server?.pid);
  await prisma.$disconnect();
  process.exit(failCount > 0 ? 1 : 0);
}

main().catch(async (e) => {
  console.log(log.join("\n"));
  console.error("Fatal:", e);
  console.log("\n--- dev server output (tail) ---\n" + devLog.slice(-40).join("\n"));
  killProcessTree(server?.pid);
  await prisma.$disconnect();
  process.exit(1);
});
