// Full end-to-end trial: registers a REAL new school through POST
// /api/register (not the direct-Prisma seedSchoolAndOwner shortcut the
// other verify-*.ts scripts use — the whole point here is to exercise the
// actual signup path a real customer goes through), then creates one of
// every core entity as that school's owner: academic year, grade, class,
// client, student, teacher, staff member, invoice. Finishes by checking
// platform settings (read, and a same-value PUT to prove the write path
// works with zero side effects). Cleans up everything it created.
//
// Run: npx tsx scripts/trial-new-school.ts

import { spawn, type ChildProcess } from "node:child_process";
import { PrismaClient } from "@prisma/client";
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

// Set as soon as the run's ids are known, so cleanup still works if the
// script dies halfway (e.g. register succeeds, a later step throws).
let trialUid: string | undefined;
let trialOwnerEmail: string | undefined;

async function cleanupTrialData(): Promise<void> {
  if (!trialUid) return;

  const owner = trialOwnerEmail
    ? await prisma.user.findUnique({ where: { email: trialOwnerEmail }, select: { schoolId: true } })
    : null;
  const schoolId = owner?.schoolId ?? undefined;

  if (schoolId) {
    await prisma.invoice.deleteMany({ where: { schoolId } });
    await prisma.client.deleteMany({ where: { schoolId } });
    await prisma.student.deleteMany({ where: { schoolId } });
    await prisma.class.deleteMany({ where: { schoolId } });
    await prisma.grade.deleteMany({ where: { schoolId } });
    await prisma.academicYear.deleteMany({ where: { schoolId } });
  }
  // Every account this run creates has the run id in its email.
  await prisma.user.deleteMany({ where: { email: { contains: trialUid } } });
  if (schoolId) {
    await prisma.school.deleteMany({ where: { id: schoolId } });
    // Role.schoolId has no foreign key, so deleting the school leaves roles behind.
    await prisma.role.deleteMany({ where: { schoolId } });
  }
}

function heading(title: string) {
  log.push(`\n${"=".repeat(70)}\n  ${title}\n${"=".repeat(70)}`);
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

function bodyId(body: unknown): string | undefined {
  if (body && typeof body === "object" && "id" in body) {
    const id = (body as { id?: unknown }).id;
    return typeof id === "string" ? id : undefined;
  }
  return undefined;
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

  const uid = `trial${Date.now()}`;
  const password = "Pass123!";
  const ownerEmail = `trial-owner-${uid}@${TEST_EMAIL_DOMAIN}`;
  const adminEmail = `trial-admin-${uid}@${TEST_EMAIL_DOMAIN}`;
  trialUid = uid;
  trialOwnerEmail = ownerEmail;

  // ── 1. Platform admin, for the platform-settings check later ──
  heading("SETUP: platform admin");
  const bcrypt = await import("bcryptjs");
  await prisma.user.create({
    data: { email: adminEmail, password: await bcrypt.hash(password, 12), role: "ADMIN", schoolId: null },
  });
  const cookieAdmin = await login(adminEmail, password);
  if (!cookieAdmin) throw new Error("admin login failed");

  // ── 2. Open a new school — the REAL signup flow, not a shortcut ──
  heading("1. Register a new school (POST /api/register — the real flow)");
  let regRes = await fetch(`${BASE}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ownerEmail, password }),
  });
  let reg = (await regRes.json().catch(() => ({}))) as { schoolId?: string; error?: string };
  result("/api/register", "POST", regRes.status, "open a new school", 200);
  if (!reg.schoolId) {
    // register()'s transaction is known to be flaky under load (see
    // CHANGELOG.md tech debt) — one retry before giving up, same as a real
    // user hitting "sign up" twice.
    log.push(`  (first attempt gave no schoolId — ${reg.error ?? "no error message"} — retrying once)`);
    regRes = await fetch(`${BASE}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: ownerEmail, password }),
    });
    reg = (await regRes.json().catch(() => ({}))) as { schoolId?: string; error?: string };
    result("/api/register", "POST", regRes.status, "open a new school (retry)", 200);
  }
  if (!reg.schoolId) {
    throw new Error(`register failed twice — not a feature bug, see CHANGELOG.md tech debt on the register() transaction (last error: ${reg.error})`);
  }
  const schoolId = reg.schoolId;
  log.push(`  school created: ${schoolId}`);

  const cookieOwner = await login(ownerEmail, password);
  if (!cookieOwner) throw new Error("owner login failed");
  log.push("  owner logged in");

  let r: HttpResult;
  const ids: Record<string, string> = {};

  // ── 3. Academic year ──────────────────────────────────────────
  heading("2. Academic year");
  r = await authed("/api/academic-years", {
    method: "POST",
    body: JSON.stringify({
      schoolId,
      name: "2026-2027",
      startDate: "2026-09-01",
      endDate: "2027-06-30",
      isCurrent: true,
    }),
  }, cookieOwner);
  result("/api/academic-years", "POST", r.status, "create the school's first academic year", 201);
  ids.academicYearId = bodyId(r.body) ?? "";
  assert(Boolean(ids.academicYearId), "academic year id returned");

  // ── 4. Grade ──────────────────────────────────────────────────
  heading("3. Grade");
  r = await authed("/api/grades", {
    method: "POST",
    body: JSON.stringify({ schoolId, name: "Grade 1", order: 1 }),
  }, cookieOwner);
  result("/api/grades", "POST", r.status, "create a grade", 201);
  ids.gradeId = bodyId(r.body) ?? "";
  assert(Boolean(ids.gradeId), "grade id returned");

  // ── 5. Class (needs the grade + academic year above) ───────────
  heading("4. Class");
  if (!ids.gradeId || !ids.academicYearId) {
    // A class needs both; failing here too would just be noise on top of
    // the real failure already reported above.
    log.push("  SKIP POST /api/classes — the grade or academic year above wasn't created");
  } else {
    r = await authed("/api/classes", {
      method: "POST",
      body: JSON.stringify({
        schoolId,
        gradeId: ids.gradeId,
        academicYearId: ids.academicYearId,
        name: "Section A",
        code: "G1-A",
      }),
    }, cookieOwner);
    result("/api/classes", "POST", r.status, "create a class in that grade/academic year", 201);
    ids.classId = bodyId(r.body) ?? "";
    assert(Boolean(ids.classId), "class id returned");
  }

  // ── 6. Client ─────────────────────────────────────────────────
  heading("5. Client");
  r = await authed("/api/clients", {
    method: "POST",
    body: JSON.stringify({ schoolId, name: "Trial Parent Client" }),
  }, cookieOwner);
  result("/api/clients", "POST", r.status, "create a client (e.g. a parent)", 201);
  ids.clientId = bodyId(r.body) ?? "";
  assert(Boolean(ids.clientId), "client id returned");

  // ── 7. Student ────────────────────────────────────────────────
  heading("6. Student");
  r = await authed("/api/students", {
    method: "POST",
    body: JSON.stringify({
      schoolId,
      code: `STU-${uid}`,
      firstName: "Trial",
      lastName: "Student",
      dateOfBirth: "2015-01-01",
    }),
  }, cookieOwner);
  result("/api/students", "POST", r.status, "create a student", 201);
  ids.studentId = bodyId(r.body) ?? "";
  assert(Boolean(ids.studentId), "student id returned");

  // ── 8. Teacher ────────────────────────────────────────────────
  heading("7. Teacher");
  r = await authed("/api/teachers", {
    method: "POST",
    body: JSON.stringify({
      schoolId,
      name: "Trial Teacher",
      email: `trial-teacher-${uid}@${TEST_EMAIL_DOMAIN}`,
      password,
      specialization: "Mathematics",
    }),
  }, cookieOwner);
  result("/api/teachers", "POST", r.status, "create a teacher account", 201);
  ids.teacherId = bodyId(r.body) ?? "";
  assert(Boolean(ids.teacherId), "teacher id returned");

  // ── 9. Staff ──────────────────────────────────────────────────
  heading("8. Staff");
  r = await authed("/api/staff", {
    method: "POST",
    body: JSON.stringify({
      schoolId,
      name: "Trial Staff",
      email: `trial-staff-${uid}@${TEST_EMAIL_DOMAIN}`,
      password,
      position: "Receptionist",
    }),
  }, cookieOwner);
  result("/api/staff", "POST", r.status, "create a staff account", 201);
  ids.staffId = bodyId(r.body) ?? "";
  assert(Boolean(ids.staffId), "staff id returned");

  // ── 10. Invoice (billed to the client created above) ───────────
  heading("9. Invoice");
  if (!ids.clientId) {
    log.push("  SKIP POST /api/invoices — the client above wasn't created");
  } else {
    r = await authed("/api/invoices", {
      method: "POST",
      body: JSON.stringify({ schoolId, amount: 500, clientId: ids.clientId }),
    }, cookieOwner);
    result("/api/invoices", "POST", r.status, "create an invoice for the client", 201);
    ids.invoiceId = bodyId(r.body) ?? "";
    assert(Boolean(ids.invoiceId), "invoice id returned");
  }

  // ── 11. Read every entity back (own-school visibility) ─────────
  heading("10. Read everything back");
  const reads: Array<[string, string]> = [
    ["academic-years", ids.academicYearId],
    ["grades", ids.gradeId],
    ["classes", ids.classId],
    ["clients", ids.clientId],
    ["students", ids.studentId],
    ["teachers", ids.teacherId],
    ["staff", ids.staffId],
    ["invoices", ids.invoiceId],
  ];
  for (const [resource, id] of reads) {
    if (!id) { log.push(`  SKIP GET /api/${resource}/... — no id (creation above failed)`); continue; }
    r = await authed(`/api/${resource}/${id}`, {}, cookieOwner);
    result(`/api/${resource}/${id}`, "GET", r.status, `owner reads their own ${resource.replace(/s$/, "")}`, 200);
  }

  // ── Tenant scoping: straight from the database, not from API replies ──
  heading("10b. Everything created belongs to the NEW school (database check)");
  const scopeChecks: Array<[string, string, () => Promise<{ schoolId: string } | null>]> = [
    ["academic year", ids.academicYearId, () => prisma.academicYear.findUnique({ where: { id: ids.academicYearId }, select: { schoolId: true } })],
    ["grade", ids.gradeId, () => prisma.grade.findUnique({ where: { id: ids.gradeId }, select: { schoolId: true } })],
    ["class", ids.classId, () => prisma.class.findUnique({ where: { id: ids.classId }, select: { schoolId: true } })],
    ["client", ids.clientId, () => prisma.client.findUnique({ where: { id: ids.clientId }, select: { schoolId: true } })],
    ["student", ids.studentId, () => prisma.student.findUnique({ where: { id: ids.studentId }, select: { schoolId: true } })],
    ["teacher profile", ids.teacherId, () => prisma.teacherProfile.findUnique({ where: { id: ids.teacherId }, select: { schoolId: true } })],
    ["staff profile", ids.staffId, () => prisma.staffProfile.findUnique({ where: { id: ids.staffId }, select: { schoolId: true } })],
    ["invoice", ids.invoiceId, () => prisma.invoice.findUnique({ where: { id: ids.invoiceId }, select: { schoolId: true } })],
  ];
  for (const [label, id, lookup] of scopeChecks) {
    if (!id) { log.push(`  SKIP ${label} — not created above`); continue; }
    const row = await lookup();
    assert(row?.schoolId === schoolId, `${label} belongs to the new school`);
  }

  // ── 12. Platform settings — read, then a same-value PUT ────────
  heading("11. Platform settings (platform admin)");
  r = await authed("/api/platform-settings", {}, cookieAdmin);
  result("/api/platform-settings", "GET", r.status, "platform admin reads platform settings", 200);
  const currentSettings = (r.body ?? {}) as { trialDurationDays?: number; maintenanceMode?: boolean };
  log.push(`  current trialDurationDays: ${currentSettings.trialDurationDays}, maintenanceMode: ${currentSettings.maintenanceMode}`);

  if (typeof currentSettings.trialDurationDays === "number") {
    // Writes back the SAME value — exercises the write path with zero
    // behavioral change for every other school on the platform. The route
    // exports GET and PUT only (no PATCH — an earlier version of this script
    // assumed PATCH and got a 405 that was the script's mistake, not a
    // missing feature). PUT here is a partial update: the repository calls
    // prisma.platformSettings.update({ data }) and every schema field is
    // optional, so only the field sent is written.
    r = await authed("/api/platform-settings", {
      method: "PUT",
      body: JSON.stringify({ trialDurationDays: currentSettings.trialDurationDays }),
    }, cookieAdmin);
    result("/api/platform-settings", "PUT", r.status, "platform admin writes back the same trialDurationDays (no-op)", 200);
  } else {
    log.push("  SKIP PUT /api/platform-settings — GET didn't return trialDurationDays as a number, won't guess a value");
  }

  r = await authed("/api/platform-settings", {}, cookieOwner);
  result("/api/platform-settings", "GET", r.status, "a school owner (not platform admin) is rejected", 403);

  // ── Cleanup ──────────────────────────────────────────────────
  heading("Cleanup");
  await cleanupTrialData();
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
  try {
    await cleanupTrialData();
    console.log("(cleanup of this run's test data attempted after the failure)");
  } catch (cleanupErr) {
    console.error("Cleanup after failure ALSO failed — look for leftover @test.local rows:", cleanupErr);
  }
  await prisma.$disconnect();
  process.exit(1);
});
