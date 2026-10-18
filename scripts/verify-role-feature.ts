// Standalone, minimal verification of PUT/DELETE /api/schools/[id]/users/[userId]/role.
// Built to answer one question: did Section 10's 404s in the last full-suite
// run reflect a real regression in the already-shipped (d514bfb) role route,
// or environmental noise? Mirrors verify-delete-feature.ts's structure.
// Run: npx tsx scripts/verify-role-feature.ts

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

  const uid = `rol${Date.now()}`;
  const password = "Pass123!";
  const emailA = `rolv-a-${uid}@${TEST_EMAIL_DOMAIN}`;

  heading("SETUP: one school, its owner, one member");

  // Seeded directly via Prisma, not through POST /api/register — see
  // scripts/lib/seed-test-school.ts for why.
  const { schoolId: sidA } = await seedSchoolAndOwner(prisma, emailA, password);

  const cookieA = await login(emailA, password);
  if (!cookieA) throw new Error("login failed");

  const bcrypt = await import("bcryptjs");
  const memberUser = await prisma.user.create({ data: { email: `rolv-member-${uid}@${TEST_EMAIL_DOMAIN}`, password: await bcrypt.hash(password, 12), role: "TEACHER", schoolId: sidA } });
  const roleA_teacher = await prisma.role.findFirstOrThrow({ where: { schoolId: sidA, systemKey: "TEACHER" } });
  const roleA_staff = await prisma.role.findFirstOrThrow({ where: { schoolId: sidA, systemKey: "STAFF" } });
  log.push(`  school ready (school A: ${sidA}), member: ${memberUser.id}`);

  const roleRoute = (schoolId: string, userId: string) => `/api/schools/${schoolId}/users/${userId}/role`;
  let r: HttpResult;

  heading("Role assignment (PUT/DELETE .../users/[userId]/role)");

  subheading("Baseline: member has no role");
  assert((await prisma.userRole.count({ where: { userId: memberUser.id, schoolId: sidA } })) === 0, "member starts with zero UserRole rows");

  subheading("Assign TEACHER");
  r = await authed(roleRoute(sidA, memberUser.id), { method: "PUT", body: JSON.stringify({ roleId: roleA_teacher.id }) }, cookieA);
  result(roleRoute(sidA, memberUser.id), "PUT", r.status, "owner assigns TEACHER", 200);
  assert((await prisma.userRole.findFirst({ where: { userId: memberUser.id, schoolId: sidA } }))?.roleId === roleA_teacher.id, "member now holds TEACHER");

  subheading("Re-assign to STAFF (replaces, no duplicate)");
  r = await authed(roleRoute(sidA, memberUser.id), { method: "PUT", body: JSON.stringify({ roleId: roleA_staff.id }) }, cookieA);
  result(roleRoute(sidA, memberUser.id), "PUT", r.status, "owner moves member to STAFF", 200);
  assert((await prisma.userRole.count({ where: { userId: memberUser.id, schoolId: sidA } })) === 1, "exactly one UserRole row after reassignment");

  subheading("Remove role");
  r = await authed(roleRoute(sidA, memberUser.id), { method: "DELETE" }, cookieA);
  result(roleRoute(sidA, memberUser.id), "DELETE", r.status, "owner removes member's role", 200);
  assert((await prisma.userRole.count({ where: { userId: memberUser.id, schoolId: sidA } })) === 0, "zero UserRole rows after removal");

  heading("Cleanup");
  await prisma.user.deleteMany({ where: { email: { contains: uid } } });
  await prisma.school.delete({ where: { id: sidA } });
  await prisma.role.deleteMany({ where: { schoolId: sidA } });
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
