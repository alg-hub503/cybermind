// CyberMind Security Regression Suite — CI entry point
// Spawns a dev server, runs RBAC + tenant-isolation tests over real HTTP,
// plus module-level tests for the server-action role policy.
// Run: npm run test:security  (or: npx tsx scripts/security-regression.ts)

import { spawn, type ChildProcess } from "node:child_process";
import { PrismaClient } from "@prisma/client";

const BASE = "http://localhost:3000";
const TEST_EMAIL_DOMAIN = "test.local";
const PORT_READY_TIMEOUT_MS = 180_000;

type HttpResult = { status: number; body: unknown };

let server: ChildProcess | null = null;
let prisma: PrismaClient | null = null;

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

function result(
  path: string,
  method: string,
  status: number,
  description: string,
  expected: number
) {
  testCount++;
  if (status === expected) {
    passCount++;
    log.push(`  PASS ${method} ${path} -> ${status}  (${description})`);
  } else {
    failCount++;
    log.push(`  FAIL ${method} ${path} -> ${status} (expected ${expected})  (${description})`);
  }
}

function assert(condition: boolean, description: string) {
  testCount++;
  if (condition) {
    passCount++;
    log.push(`  PASS assertion: ${description}`);
  } else {
    failCount++;
    log.push(`  FAIL assertion: ${description}`);
  }
}

// ── Dev server lifecycle ─────────────────────────────────────────

async function waitForServer(): Promise<boolean> {
  const deadline = Date.now() + PORT_READY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (server?.exitCode !== null && server?.exitCode !== undefined) {
      return false;
    }
    try {
      const res = await fetch(`${BASE}/api/auth/csrf`);
      if (res.ok) return true;
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  return false;
}

function startDevServer(): ChildProcess {
  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
  const child = spawn(npmCmd, ["run", "dev"], {
    cwd: process.cwd(),
    stdio: ["ignore", "pipe", "pipe"],
    shell: process.platform === "win32",
  });
  child.stdout?.on("data", (d: Buffer) => devLog.push(d.toString().trimEnd()));
  child.stderr?.on("data", (d: Buffer) => devLog.push(d.toString().trimEnd()));
  return child;
}

// ── Auth helpers ─────────────────────────────────────────────────

async function login(email: string, password: string): Promise<string | null> {
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`, { redirect: "manual" });
  const rawCookies = csrfRes.headers.get("set-cookie") || "";
  const cookies: string[] = [];
  for (const c of rawCookies.split(/(?<!Expires=[^;]*),(?! )/)) {
    cookies.push(c.split(";")[0].trim());
  }
  const { csrfToken } = await csrfRes.json();
  if (!csrfToken) return null;

  const loginRes = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookies.join("; "),
    },
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

async function authed(path: string, options: RequestInit = {}, cookie?: string): Promise<HttpResult> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      ...(options.headers as Record<string, string> | undefined),
      Cookie: cookie || "",
      "Content-Type": "application/json",
    },
    redirect: "manual",
  });
  return parseResponse(res);
}

async function raw(path: string, options: RequestInit = {}): Promise<HttpResult> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    redirect: "manual",
  });
  return parseResponse(res);
}

async function parseResponse(res: Response): Promise<HttpResult> {
  const ct = res.headers.get("content-type") || "";
  let body: unknown = null;
  if (ct.includes("application/json")) {
    try {
      body = await res.json();
    } catch {
      body = null;
    }
  } else {
    body = await res.text();
  }
  return { status: res.status, body };
}

// ── DB helpers ───────────────────────────────────────────────────

async function preCleanStaleTestData() {
  const staleUsers = await prisma!.user.findMany({
    where: { email: { endsWith: `@${TEST_EMAIL_DOMAIN}` } },
    select: { id: true, schoolId: true },
  });
  const schoolIds = staleUsers
    .map((u) => u.schoolId)
    .filter((s): s is string => Boolean(s));
  if (schoolIds.length > 0) {
    await prisma!.invoice.deleteMany({ where: { schoolId: { in: schoolIds } } });
    await prisma!.client.deleteMany({ where: { schoolId: { in: schoolIds } } });
    await prisma!.school.deleteMany({ where: { id: { in: schoolIds } } });
  }
  await prisma!.user.deleteMany({ where: { email: { endsWith: `@${TEST_EMAIL_DOMAIN}` } } });
  log.push(`  Pre-cleaned ${staleUsers.length} stale test account(s)`);
}

// ── Tests ────────────────────────────────────────────────────────

async function runSuite() {
  const uid = Date.now();
  const adminEmail = `reg-admin-${uid}@${TEST_EMAIL_DOMAIN}`;
  const emailA = `reg-a-${uid}@${TEST_EMAIL_DOMAIN}`;
  const emailB = `reg-b-${uid}@${TEST_EMAIL_DOMAIN}`;
  const password = "Pass123!";

  heading("SETUP: accounts");
  const admin = await prisma!.user.create({
    data: {
      email: adminEmail,
      password: await (await import("bcryptjs")).hash(password, 12),
      role: "ADMIN",
      schoolId: null,
    },
  });

  const regA = await (await fetch(`${BASE}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: emailA, password }),
  })).json() as { schoolId?: string; email?: string };

  const regB = await (await fetch(`${BASE}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: emailB, password }),
  })).json() as { schoolId?: string; email?: string };

  if (!regA.schoolId || !regB.schoolId) throw new Error("register failed");
  const sidA = regA.schoolId;
  const sidB = regB.schoolId;
  log.push(`  ADMIN: ${adminEmail}\n  USER_A (school A): ${emailA}\n  USER_B (school B): ${emailB}`);

  const cookieAdmin = await login(adminEmail, password);
  const cookieA = await login(emailA, password);
  const cookieB = await login(emailB, password);
  if (!cookieAdmin || !cookieA || !cookieB) throw new Error("login failed");
  log.push("  All sessions obtained");

  // ── 1. Anonymous ──────────────────────────────────────────
  heading("1. ANONYMOUS access -> 401 / redirect");

  let r: HttpResult = await raw("/api/students");
  result("/api/students", "GET", r.status, "no session", 401);
  r = await raw("/api/invoices");
  result("/api/invoices", "GET", r.status, "no session", 401);
  r = await raw("/api/admin");
  result("/api/admin", "GET", r.status, "no session", 401);
  r = await raw("/api/admin-stats");
  result("/api/admin-stats", "GET", r.status, "no session", 401);
  r = await raw("/api/grades", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ schoolId: sidA, name: "Ghost", order: 99 }),
  });
  result("/api/grades", "POST", r.status, "no session mutation", 401);
  r = await raw("/dashboard");
  result("/dashboard", "GET", r.status, "no session page redirects", 307);

  // ── 2. ADMIN platform access ──────────────────────────────
  heading("2. ADMIN platform access -> allowed");

  r = await authed("/api/admin", {}, cookieAdmin);
  result("/api/admin", "GET", r.status, "platform stats", 200);
  r = await authed("/api/admin-stats", {}, cookieAdmin);
  result("/api/admin-stats", "GET", r.status, "platform stats", 200);

  subheading("Seed school A resources (as ADMIN)");
  let res = await authed("/api/students", {
    method: "POST",
    body: JSON.stringify({ schoolId: sidA, code: `S-A-${uid}`, firstName: "ALICEZZZ", lastName: "A" }),
  }, cookieAdmin);
  const studentA = (res.body as { id?: string })?.id as string;
  result("/api/students", "POST", res.status, "seed student A", 201);

  res = await authed("/api/clients", { method: "POST", body: JSON.stringify({ schoolId: sidA, name: "Client A" }) }, cookieAdmin);
  const clientA = (res.body as { id?: string })?.id as string;
  result("/api/clients", "POST", res.status, "seed client A", 201);

  res = await authed("/api/grades", { method: "POST", body: JSON.stringify({ schoolId: sidA, name: "Grade A", order: 0 }) }, cookieAdmin);
  const gradeA = (res.body as { id?: string })?.id as string;
  result("/api/grades", "POST", res.status, "seed grade A", 201);

  res = await authed("/api/academic-years", { method: "POST", body: JSON.stringify({ schoolId: sidA, name: "AY", startDate: "2026-01-01", endDate: "2026-12-31" }) }, cookieAdmin);
  const yearA = (res.body as { id?: string })?.id as string;
  result("/api/academic-years", "POST", res.status, "seed academic year A", 201);

  res = await authed("/api/classes", { method: "POST", body: JSON.stringify({ schoolId: sidA, gradeId: gradeA, academicYearId: yearA, name: "Class A", code: `CL-A-${uid}` }) }, cookieAdmin);
  const classA = (res.body as { id?: string })?.id as string;
  result("/api/classes", "POST", res.status, "seed class A", 201);

  res = await authed("/api/invoices", { method: "POST", body: JSON.stringify({ schoolId: sidA, clientId: clientA, amount: 100 }) }, cookieAdmin);
  const invoiceA = (res.body as { id?: string })?.id as string;
  result("/api/invoices", "POST", res.status, "seed invoice A", 201);

  // ── 3. USER: own school allowed ───────────────────────────
  heading("3. USER (school A): own resources -> allowed");

  r = await authed("/api/students", {}, cookieA);
  result("/api/students", "GET", r.status, "list own students", 200);
  const list = r.body as Array<{ schoolId: string }>;
  assert(list.every((s) => s.schoolId === sidA), "list contains only own-school rows");

  const own = [
    ["students", studentA, { firstName: "Updated" }],
    ["clients", clientA, { name: "Updated" }],
    ["grades", gradeA, { name: "Updated" }],
    ["academic-years", yearA, { name: "Updated" }],
    ["classes", classA, { name: "Updated" }],
    ["invoices", invoiceA, { amount: 200 }],
  ] as const;
  for (const [resource, id] of own) {
    r = await authed(`/api/${resource}/${id}`, {}, cookieA);
    result(`/api/${resource}/${id}`, "GET", r.status, `own ${resource} read`, 200);
  }

  // ── 4. USER: cross-tenant blocked ─────────────────────────
  heading("4. USER: cross-tenant writes -> 403");

  const crossPosts: Array<[string, Record<string, unknown>]> = [
    ["students", { schoolId: sidB, code: `X-${uid}`, firstName: "Eve", lastName: "B" }],
    ["clients", { schoolId: sidB, name: "Evil" }],
    ["grades", { schoolId: sidB, name: "Evil", order: 1 }],
    ["academic-years", { schoolId: sidB, name: "Evil", startDate: "2026-01-01", endDate: "2026-12-31" }],
    ["classes", { schoolId: sidB, gradeId: gradeA, academicYearId: yearA, name: "Evil", code: `EV-${uid}` }],
    ["invoices", { schoolId: sidB, clientId: clientA, amount: 1 }],
  ];
  for (const [resource, body] of crossPosts) {
    r = await authed(`/api/${resource}`, { method: "POST", body: JSON.stringify(body) }, cookieA);
    result(`/api/${resource}`, "POST", r.status, `write into school B`, 403);
  }

  heading("5. USER B: IDOR on school A resources -> 403");

  const idor = [
    ["students", studentA, { firstName: "Hacked" }],
    ["clients", clientA, { name: "Hacked" }],
    ["grades", gradeA, { name: "Hacked" }],
    ["academic-years", yearA, { name: "Hacked" }],
    ["classes", classA, { name: "Hacked" }],
    ["invoices", invoiceA, { amount: 999 }],
  ] as const;
  for (const [resource, id, patch] of idor) {
    r = await authed(`/api/${resource}/${id}`, {}, cookieB);
    result(`/api/${resource}/${id}`, "GET", r.status, `B reads A's ${resource}`, 403);
    r = await authed(`/api/${resource}/${id}`, { method: "PUT", body: JSON.stringify(patch) }, cookieB);
    result(`/api/${resource}/${id}`, "PUT", r.status, `B updates A's ${resource}`, 403);
    r = await authed(`/api/${resource}/${id}`, { method: "DELETE" }, cookieB);
    result(`/api/${resource}/${id}`, "DELETE", r.status, `B deletes A's ${resource}`, 403);
  }

  r = await authed(`/api/schools/${sidA}`, {}, cookieB);
  result(`/api/schools/${sidA}`, "GET", r.status, "B reads school A", 403);

  subheading("USER A: no platform admin access");
  r = await authed("/api/admin", {}, cookieA);
  result("/api/admin", "GET", r.status, "A -> admin", 403);
  r = await authed("/api/admin-stats", {}, cookieA);
  result("/api/admin-stats", "GET", r.status, "A -> admin stats", 403);

  subheading("Server-action route guards (school workspace)");
  r = await authed(`/dashboard/schools/${sidA}/users/new`, {}, cookieB);
  result(`/dashboard/schools/${sidA}/users/new`, "GET", r.status, "B reaches A's add-user page", 404);
  r = await authed(`/dashboard/schools/${sidA}/users`, {}, cookieB);
  result(`/dashboard/schools/${sidA}/users`, "GET", r.status, "B reaches A's users page", 404);

  // ── 6. Analytics tenant isolation ─────────────────────────
  heading("6. Analytics tenant isolation");

  r = await authed("/dashboard/analytics", {}, cookieB);
  const htmlB = typeof r.body === "string" ? r.body : "";
  result("/dashboard/analytics", "GET", r.status, "B renders analytics", 200);
  assert(!htmlB.includes("ALICEZZZ"), "B's analytics page contains no school A data");

  // ── 7. Server-action role policy (module level) ───────────
  heading("7. Server action: USER cannot create ADMIN");

  const { createSchoolUserCore } = await import("@/lib/actions/school-user-actions");

  const userCaller = { role: "USER" };
  const adminCaller = { role: "ADMIN" };

  const clamped = await createSchoolUserCore(userCaller, {
    schoolId: sidA,
    name: "Clamped User",
    email: `clamped-${uid}@${TEST_EMAIL_DOMAIN}`,
    password,
    role: "ADMIN",
  });
  assert(clamped.role === "USER", "USER caller requesting ADMIN -> created as USER");

  const byAdmin = await createSchoolUserCore(adminCaller, {
    schoolId: sidA,
    name: "Admin Created",
    email: `byadmin-${uid}@${TEST_EMAIL_DOMAIN}`,
    password,
    role: "ADMIN",
  });
  assert(byAdmin.role === "ADMIN", "ADMIN caller requesting ADMIN -> created as ADMIN");

  let duplicateRejected = false;
  try {
    await createSchoolUserCore(userCaller, {
      schoolId: sidA,
      name: "Dup",
      email: `clamped-${uid}@${TEST_EMAIL_DOMAIN}`,
      password,
      role: "USER",
    });
  } catch (e) {
    duplicateRejected = e instanceof Error && e.message === "USER_EXISTS";
  }
  assert(duplicateRejected, "duplicate email -> USER_EXISTS");

  let invalidRejected = false;
  try {
    await createSchoolUserCore(userCaller, {
      schoolId: sidA,
      name: "Bad",
      email: "not-an-email",
      password,
      role: "USER",
    });
  } catch (e) {
    invalidRejected = e instanceof Error && e.message === "INVALID_INPUT";
  }
  assert(invalidRejected, "invalid email -> INVALID_INPUT");

  // ── Cleanup ───────────────────────────────────────────────
  heading("Cleanup");
  const testEmails = [
    emailA, emailB, `clamped-${uid}@${TEST_EMAIL_DOMAIN}`, `byadmin-${uid}@${TEST_EMAIL_DOMAIN}`,
  ];
  await prisma!.invoice.deleteMany({ where: { schoolId: { in: [sidA, sidB] } } });
  await prisma!.client.deleteMany({ where: { schoolId: { in: [sidA, sidB] } } });
  await prisma!.user.deleteMany({ where: { email: { in: testEmails } } });
  await prisma!.user.delete({ where: { id: admin.id } });
  await prisma!.school.deleteMany({ where: { id: { in: [sidA, sidB] } } });
  log.push("  Test data removed");
}

// ── Main ────────────────────────────────────────────────────────

async function main() {
  prisma = new PrismaClient();
  await prisma.$connect();
  await preCleanStaleTestData();

  heading("Starting dev server");
  server = startDevServer();
  const ready = await waitForServer();
  if (!ready) {
    log.push("  FAIL dev server did not become ready");
    failCount++;
  } else {
    log.push("  Dev server ready");
    try {
      await runSuite();
    } finally {
      try {
        await preCleanStaleTestData();
      } catch (e) {
        log.push(`  Cleanup warning: ${(e as Error).message}`);
      }
    }
  }

  server?.kill();
  await prisma.$disconnect();

  log.push(`\n${"=".repeat(70)}`);
  log.push(`  RESULTS: ${passCount} passed, ${failCount} failed, ${testCount} total`);
  log.push(`${"=".repeat(70)}`);
  console.log(log.join("\n"));
  if (devLog.length > 0) {
    console.log(`\n  --- dev server output (tail) ---`);
    console.log(devLog.slice(-30).join("\n"));
  }
  process.exit(failCount === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error("Fatal:", e);
  server?.kill();
  process.exit(1);
});
