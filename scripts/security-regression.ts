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

  // register() only grants MANAGE_BILLING to the school owner if the permission
  // row exists. Make sure it does (idempotent — same row the seed script makes).
  await prisma!.permission.upsert({
    where: { code: "MANAGE_BILLING" },
    update: {},
    create: { code: "MANAGE_BILLING", description: "Create, edit, delete invoices and clients" },
  });

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
    ["grades", { schoolId: sidB, name: "Evil", order: 1 }],
    ["academic-years", { schoolId: sidB, name: "Evil", startDate: "2026-01-01", endDate: "2026-12-31" }],
    ["classes", { schoolId: sidB, gradeId: gradeA, academicYearId: yearA, name: "Evil", code: `EV-${uid}` }],
    ["invoices", { schoolId: sidB, clientId: clientA, amount: 1 }],
  ];
  for (const [resource, body] of crossPosts) {
    r = await authed(`/api/${resource}`, { method: "POST", body: JSON.stringify(body) }, cookieA);
    result(`/api/${resource}`, "POST", r.status, `write into school B`, 403);
  }

  // Clients behave differently on purpose: for a school user the route IGNORES
  // the schoolId in the body and forces the caller's own school (see
  // app/api/clients/route.ts). So the invariant is not "403" but
  // "nothing is ever written into school B".
  const evilName = `Evil-${uid}`;
  r = await authed("/api/clients", { method: "POST", body: JSON.stringify({ schoolId: sidB, name: evilName }) }, cookieA);
  result("/api/clients", "POST", r.status, "body schoolId ignored; created in caller's own school", 201);
  assert(
    (r.body as { schoolId?: string } | null)?.schoolId === sidA,
    "the new client belongs to school A (the caller's), not school B"
  );
  assert(
    (await prisma!.client.count({ where: { schoolId: sidB, name: evilName } })) === 0,
    "no client was written into school B"
  );

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
  heading("7. Server action: no admin session -> nothing is created");

  const { createSchoolUser } = await import("@/lib/actions/school-user-actions");

  // This runs outside a Next.js request, so there is no session and
  // getServerSession() cannot even read cookies. What can be proven here is that
  // the action never creates a user without an authenticated admin. The
  // "school user -> FORBIDDEN" rule of requireAdmin() is covered over HTTP in
  // section 5 (GET /api/admin as a school user -> 403).
  const unauthEmail = `unauth-${uid}@${TEST_EMAIL_DOMAIN}`;
  let userCreateRejected = false;
  try {
    await createSchoolUser({
      schoolId: sidA,
      name: "Unauthorized User",
      email: unauthEmail,
      password,
      role: "USER",
    });
  } catch {
    userCreateRejected = true;
  }
  assert(userCreateRejected, "createSchoolUser without an admin session throws");
  assert(
    (await prisma!.user.findUnique({ where: { email: unauthEmail } })) === null,
    "createSchoolUser without an admin session creates no user row"
  );

  // ── 8. Stripe billing routes need MANAGE_BILLING ──────────
  heading("8. Stripe billing routes require MANAGE_BILLING");

  const bcryptjs = await import("bcryptjs");
  const jsonHeaders = { "Content-Type": "application/json" };

  // A school member with NO role assignment — what teachers/staff created from
  // the admin UI look like today: a valid session, but zero permissions.
  const memberEmail = `reg-member-${uid}@${TEST_EMAIL_DOMAIN}`;
  await prisma!.user.create({
    data: {
      email: memberEmail,
      password: await bcryptjs.hash(password, 12),
      role: "TEACHER",
      schoolId: sidA,
    },
  });
  const cookieMember = await login(memberEmail, password);
  if (!cookieMember) throw new Error("member login failed");

  const stripePaths = [
    "/api/stripe/cancel-subscription",
    "/api/stripe/portal",
    "/api/stripe/checkout",
  ];
  for (const path of stripePaths) {
    r = await raw(path, { method: "POST", headers: jsonHeaders, body: "{}" });
    result(path, "POST", r.status, "no session", 401);
    r = await authed(path, { method: "POST", body: JSON.stringify({ schoolId: sidA }) }, cookieMember);
    result(path, "POST", r.status, "school member without MANAGE_BILLING", 403);
  }

  subheading("School owner (MANAGE_BILLING) passes the permission check — no Stripe call is made");
  r = await authed("/api/stripe/cancel-subscription", { method: "POST", body: "{}" }, cookieA);
  result("/api/stripe/cancel-subscription", "POST", r.status, "owner; school has no subscription row", 404);
  r = await authed("/api/stripe/portal", { method: "POST", body: "{}" }, cookieA);
  result("/api/stripe/portal", "POST", r.status, "owner; school has no Stripe customer", 404);

  subheading("Expired trial: normal routes are blocked, billing routes stay reachable");
  const trialBefore = await prisma!.schoolSettings.findUnique({
    where: { schoolId: sidA },
    select: { trialEnd: true },
  });
  await prisma!.schoolSettings.update({
    where: { schoolId: sidA },
    data: { trialEnd: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  });
  r = await authed("/api/students", {}, cookieA);
  result("/api/students", "GET", r.status, "expired trial blocks normal routes", 403);
  r = await authed("/api/stripe/portal", { method: "POST", body: "{}" }, cookieA);
  result("/api/stripe/portal", "POST", r.status, "expired trial, owner still reaches billing (404 = no customer)", 404);
  r = await authed("/api/stripe/portal", { method: "POST", body: "{}" }, cookieMember);
  result("/api/stripe/portal", "POST", r.status, "expired trial, member without permission", 403);
  await prisma!.schoolSettings.update({
    where: { schoolId: sidA },
    data: { trialEnd: trialBefore?.trialEnd ?? null },
  });

  // ── 9. Email normalization + password policy ──────────────
  heading("9. Email normalization + password policy");

  const mixedEmail = `Reg-Case-${uid}@Test.Local`;
  const lowerEmail = mixedEmail.toLowerCase();

  r = await raw("/api/register", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ email: `  ${mixedEmail}  `, password }),
  });
  result("/api/register", "POST", r.status, "mixed-case, space-padded email is accepted", 200);
  const stored = await prisma!.user.findUnique({ where: { email: lowerEmail } });
  assert(stored !== null, "register stores the email trimmed and lower-cased");

  assert((await login(mixedEmail, password)) !== null, "login works with the original mixed-case spelling");
  assert((await login(lowerEmail, password)) !== null, "login works with the lower-case spelling");

  r = await raw("/api/register", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ email: lowerEmail, password }),
  });
  result("/api/register", "POST", r.status, "same email in another case is a duplicate", 400);

  const badPasswords: Array<[string, string]> = [
    ["7 characters", "Pass12!"],
    ["empty", ""],
    ["over 72 bytes", "a".repeat(73)],
  ];
  for (const [label, badPassword] of badPasswords) {
    r = await raw("/api/register", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ email: `short-${uid}-${label.length}@${TEST_EMAIL_DOMAIN}`, password: badPassword }),
    });
    result("/api/register", "POST", r.status, `password rejected: ${label}`, 400);
  }

  subheading("Legacy row saved with capitals (created before normalization)");
  const legacyEmail = `Legacy-Mixed-${uid}@${TEST_EMAIL_DOMAIN}`;
  const legacy = await prisma!.user.create({
    data: {
      email: legacyEmail,
      password: await bcryptjs.hash(password, 12),
      role: "USER",
      schoolId: null,
    },
  });
  assert(
    (await login(legacyEmail.toLowerCase(), password)) !== null,
    "legacy mixed-case row can log in with a lower-case email"
  );
  r = await raw("/api/auth/forgot-password", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ email: legacyEmail.toLowerCase() }),
  });
  result("/api/auth/forgot-password", "POST", r.status, "legacy row, lower-case email", 200);
  const legacyTokens = await prisma!.passwordResetToken.count({ where: { userId: legacy.id } });
  assert(legacyTokens === 1, "forgot-password finds the legacy mixed-case row (1 reset token created)");

  // ── Cleanup ───────────────────────────────────────────────
  heading("Cleanup");
  // Every account this run created has the run id in its email (any casing).
  const runUsers = await prisma!.user.findMany({
    where: { email: { contains: String(uid), mode: "insensitive" } },
    select: { id: true, schoolId: true },
  });
  const runSchoolIds = Array.from(
    new Set([
      sidA,
      sidB,
      ...runUsers.map((u) => u.schoolId).filter((s): s is string => Boolean(s)),
    ])
  );
  await prisma!.invoice.deleteMany({ where: { schoolId: { in: runSchoolIds } } });
  await prisma!.client.deleteMany({ where: { schoolId: { in: runSchoolIds } } });
  await prisma!.user.deleteMany({ where: { id: { in: [...runUsers.map((u) => u.id), admin.id] } } });
  await prisma!.school.deleteMany({ where: { id: { in: runSchoolIds } } });
  // Role.schoolId has no foreign key, so deleting a school leaves its roles behind.
  await prisma!.role.deleteMany({ where: { schoolId: { in: runSchoolIds } } });
  log.push("  Test data removed");
}

// ── Main ────────────────────────────────────────────────────────

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error(
      "Missing DATABASE_URL. In CI, add it to repository secrets " +
      "(Settings -> Secrets and variables -> Actions). Locally, ensure .env exists."
    );
    process.exit(1);
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl.startsWith("postgresql://") && !dbUrl.startsWith("postgres://")) {
    console.error(
      "DATABASE_URL is present but INVALID (must start with postgresql:// or postgres://): " +
        `length=${dbUrl.length} prefix='${dbUrl.slice(0, 13)}'`
    );
    process.exit(1);
  }

  try {
    console.log(`Testing against database host: ${new URL(dbUrl).host}`);
  } catch {
    // host is informational only
  }

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