// Standalone, minimal verification of PATCH /api/schools/[id]/users/[userId]
// (rename only). Mirrors verify-delete-feature.ts / verify-role-feature.ts.
// Run: npx tsx scripts/verify-edit-feature.ts

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

  const uid = `edt${Date.now()}`;
  const password = "Pass123!";
  const emailA = `edtv-a-${uid}@${TEST_EMAIL_DOMAIN}`;
  const emailB = `edtv-b-${uid}@${TEST_EMAIL_DOMAIN}`;

  heading("SETUP: two schools, their owners, a member, a platform admin");

  // Not bound to a variable: its id is never needed again, and cleanup
  // below removes it the same way as everything else (email contains uid).
  await prisma.user.create({
    data: { email: `edtv-admin-${uid}@${TEST_EMAIL_DOMAIN}`, password: await (await import("bcryptjs")).hash(password, 12), role: "ADMIN", schoolId: null },
  });

  // Seeded directly via Prisma, not through POST /api/register — see
  // scripts/lib/seed-test-school.ts for why.
  const { schoolId: sidA } = await seedSchoolAndOwner(prisma, emailA, password);
  const { schoolId: sidB } = await seedSchoolAndOwner(prisma, emailB, password);

  const cookieA = await login(emailA, password);
  const cookieB = await login(emailB, password);
  if (!cookieA || !cookieB) throw new Error("login failed");

  const ownerA = await prisma.user.findUniqueOrThrow({ where: { email: emailA } });
  const bcrypt = await import("bcryptjs");
  const memberA = await prisma.user.create({ data: { email: `edtv-member-${uid}@${TEST_EMAIL_DOMAIN}`, password: await bcrypt.hash(password, 12), name: "Original Name", role: "TEACHER", schoolId: sidA } });
  const strayPlatformAdmin = await prisma.user.create({ data: { email: `edtv-stray-admin-${uid}@${TEST_EMAIL_DOMAIN}`, password: await bcrypt.hash(password, 12), role: "ADMIN", schoolId: sidA } });
  log.push(`  schools ready (school A: ${sidA}), member: ${memberA.id}`);

  const userRoute = (schoolId: string, userId: string) => `/api/schools/${schoolId}/users/${userId}`;
  let r: HttpResult;

  heading("User rename (PATCH /api/schools/[id]/users/[userId])");

  subheading("Owner renames their own school's member");
  r = await authed(userRoute(sidA, memberA.id), { method: "PATCH", body: JSON.stringify({ name: "Updated Name" }) }, cookieA);
  result(userRoute(sidA, memberA.id), "PATCH", r.status, "owner renames member", 200);
  assert((await prisma.user.findUniqueOrThrow({ where: { id: memberA.id } })).name === "Updated Name", "name was actually updated in the database");

  subheading("Validation: empty name rejected");
  r = await authed(userRoute(sidA, memberA.id), { method: "PATCH", body: JSON.stringify({ name: "   " }) }, cookieA);
  result(userRoute(sidA, memberA.id), "PATCH", r.status, "whitespace-only name rejected", 400);

  subheading("Cross-school rejection");
  r = await authed(userRoute(sidA, memberA.id), { method: "PATCH", body: JSON.stringify({ name: "Hacked" }) }, cookieB);
  result(userRoute(sidA, memberA.id), "PATCH", r.status, "school B's owner is not an admin of school A", 403);
  assert((await prisma.user.findUniqueOrThrow({ where: { id: memberA.id } })).name === "Updated Name", "name was not changed by the unauthorized caller");

  subheading("Platform ADMIN accounts cannot be renamed from a school's user list");
  r = await authed(userRoute(sidA, strayPlatformAdmin.id), { method: "PATCH", body: JSON.stringify({ name: "Hacked" }) }, cookieA);
  result(userRoute(sidA, strayPlatformAdmin.id), "PATCH", r.status, "a schoolId-bearing platform ADMIN cannot be renamed here", 403);

  subheading("Self-rename is allowed (no restriction, unlike delete)");
  r = await authed(userRoute(sidA, ownerA.id), { method: "PATCH", body: JSON.stringify({ name: "Owner Renamed Self" }) }, cookieA);
  result(userRoute(sidA, ownerA.id), "PATCH", r.status, "owner renames themselves", 200);

  subheading("User.role and other fields are never touched");
  const afterMember = await prisma.user.findUniqueOrThrow({ where: { id: memberA.id } });
  assert(afterMember.role === "TEACHER", "member's platform User.role is unchanged");
  assert(afterMember.email === `edtv-member-${uid}@${TEST_EMAIL_DOMAIN}`, "member's email is unchanged");

  heading("Cleanup");
  // admin.email also contains uid, so the deleteMany below already removes
  // it — a separate prisma.user.delete({ id: admin.id }) after this throws
  // P2025 "record not found". (Found this the hard way; verify-delete-
  // feature.ts and verify-role-feature.ts never had the redundant call.)
  await prisma.user.deleteMany({ where: { email: { contains: uid } } });
  await prisma.school.deleteMany({ where: { id: { in: [sidA, sidB] } } });
  await prisma.role.deleteMany({ where: { schoolId: { in: [sidA, sidB] } } });
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
