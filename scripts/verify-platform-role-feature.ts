// Standalone, minimal verification of PATCH /api/users/[id]/role (the
// PLATFORM role toggle — separate from .../schools/[id]/users/[userId]/role).
// Checks the RULES.md ADMIN/USER schoolId invariant fix.
// Run: npx tsx scripts/verify-platform-role-feature.ts

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

  const uid = `prl${Date.now()}`;
  const password = "Pass123!";
  const actorEmail = `prl-actor-${uid}@${TEST_EMAIL_DOMAIN}`;
  const bcrypt = await import("bcryptjs");

  heading("SETUP: platform admin actor, a plain school user, a stray admin, a clean admin");

  await prisma.user.create({
    data: { email: actorEmail, password: await bcrypt.hash(password, 12), role: "ADMIN", schoolId: null },
  });
  const cookieActor = await login(actorEmail, password);
  if (!cookieActor) throw new Error("actor login failed");

  // A normal school + owner, seeded directly (not through the flaky
  // /api/register) — see scripts/lib/seed-test-school.ts.
  const { schoolId: sidA, ownerId: ownerAId } = await seedSchoolAndOwner(
    prisma,
    `prl-owner-${uid}@${TEST_EMAIL_DOMAIN}`,
    password
  );

  // A "stray" admin: already in the invalid state this whole fix targets
  // (role=ADMIN but schoolId set) — exactly the production anomaly found
  // earlier in this project. Demoting them should resolve it.
  const strayAdmin = await prisma.user.create({
    data: { email: `prl-stray-${uid}@${TEST_EMAIL_DOMAIN}`, password: await bcrypt.hash(password, 12), role: "ADMIN", schoolId: sidA },
  });

  // A clean admin (schoolId already null, as a correct ADMIN should be).
  // Demoting them has no destination school and must be blocked.
  const cleanAdmin = await prisma.user.create({
    data: { email: `prl-clean-${uid}@${TEST_EMAIL_DOMAIN}`, password: await bcrypt.hash(password, 12), role: "ADMIN", schoolId: null },
  });

  log.push(`  ready — school A: ${sidA}, owner: ${ownerAId}, stray admin: ${strayAdmin.id}, clean admin: ${cleanAdmin.id}`);

  const roleRoute = (userId: string) => `/api/users/${userId}/role`;
  let r: HttpResult;

  heading("Platform role toggle (PATCH /api/users/[id]/role)");

  subheading("Promote: USER with a schoolId -> ADMIN clears schoolId");
  r = await authed(roleRoute(ownerAId), { method: "PATCH" }, cookieActor);
  result(roleRoute(ownerAId), "PATCH", r.status, "actor promotes the school owner to ADMIN", 200);
  const promoted = await prisma.user.findUniqueOrThrow({ where: { id: ownerAId } });
  assert(promoted.role === "ADMIN", "role is now ADMIN");
  assert(promoted.schoolId === null, "schoolId was cleared on promotion (the production bug this fixes)");

  subheading("Demote: a 'stray' ADMIN that already has a schoolId resolves back to a normal USER");
  r = await authed(roleRoute(strayAdmin.id), { method: "PATCH" }, cookieActor);
  result(roleRoute(strayAdmin.id), "PATCH", r.status, "actor demotes the stray admin", 200);
  const resolved = await prisma.user.findUniqueOrThrow({ where: { id: strayAdmin.id } });
  assert(resolved.role === "USER", "role is now USER");
  assert(resolved.schoolId === sidA, "schoolId was preserved (the stray state is now resolved, not just moved)");

  subheading("Demote: a 'clean' ADMIN (no schoolId) is blocked — no destination school to use");
  r = await authed(roleRoute(cleanAdmin.id), { method: "PATCH" }, cookieActor);
  result(roleRoute(cleanAdmin.id), "PATCH", r.status, "actor tries to demote a clean admin", 400);
  const stillAdmin = await prisma.user.findUniqueOrThrow({ where: { id: cleanAdmin.id } });
  assert(stillAdmin.role === "ADMIN", "clean admin is still ADMIN (blocked, not silently left invalid)");
  assert(stillAdmin.schoolId === null, "clean admin's schoolId is still null");

  subheading("Self-change rejection (pre-existing guard, unaffected by this fix)");
  const actor = await prisma.user.findUniqueOrThrow({ where: { email: actorEmail } });
  r = await authed(roleRoute(actor.id), { method: "PATCH" }, cookieActor);
  result(roleRoute(actor.id), "PATCH", r.status, "actor tries to change their own role", 400);

  heading("Cleanup");
  await prisma.user.deleteMany({ where: { email: { contains: uid } } });
  await prisma.school.deleteMany({ where: { id: sidA } });
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
