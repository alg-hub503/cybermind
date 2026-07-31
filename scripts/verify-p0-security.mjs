// CyberMind P0 Security Verification — Authorization layer, RBAC, tenant isolation
// Run with: node scripts/verify-p0-security.mjs  (requires local dev server on :3000)
// Creates throwaway test accounts: admin + two schools (A, B), deletes them at the end.

const BASE = "http://localhost:3000";
const uid = Date.now();

let testCount = 0, passCount = 0, failCount = 0;
const log = [];

function heading(title) {
  log.push(`\n${"=".repeat(70)}`);
  log.push(`  ${title}`);
  log.push(`${"=".repeat(70)}`);
}

function subheading(title) {
  log.push(`\n  --- ${title}`);
}

function result(path, method, status, body, description, expected) {
  testCount++;
  if (status === expected) {
    passCount++;
    log.push(`  PASS ${method} ${path} -> ${status}  (${description})`);
  } else {
    failCount++;
    log.push(`  FAIL ${method} ${path} -> ${status} (expected ${expected})  (${description})`);
  }
  if (body && typeof body === "object" && body.error) {
    log.push(`       error: ${body.error}`);
  }
}

async function login(email, password) {
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`, { redirect: "manual" });
  const rawCookies = csrfRes.headers.get("set-cookie") || "";
  const csrfCookies = [];
  for (const c of rawCookies.split(/(?<!Expires=[^;]*),(?! )/)) {
    csrfCookies.push(c.split(";")[0].trim());
  }
  const { csrfToken } = await csrfRes.json();
  if (!csrfToken) return null;

  const loginRes = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": csrfCookies.join("; "),
    },
    body: new URLSearchParams({ email, password, csrfToken, callbackUrl: "/dashboard" }),
    redirect: "manual",
  });

  const setCookie = loginRes.headers.get("set-cookie");
  if (!setCookie) return null;
  const cookies = setCookie.split(/(?<!Expires=[^;]*),(?! )/);
  for (const c of cookies) {
    const m = c.match(/next-auth\.session-token=([^;]+)/);
    if (m) return `next-auth.session-token=${m[1]}`;
  }
  return null;
}

async function authed(path, options = {}, cookie) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      "Cookie": cookie || "",
      "Content-Type": "application/json",
    },
    redirect: "manual",
  });
  const ct = res.headers.get("content-type") || "";
  let body = null;
  if (ct.includes("application/json")) {
    try { body = await res.json(); } catch { body = null; }
  } else {
    body = await res.text();
  }
  return { status: res.status, body };
}

try {
  const { PrismaClient } = await import("@prisma/client");
  const bcrypt = await import("bcryptjs");
  const prisma = new PrismaClient();

  // ── SETUP ────────────────────────────────────────────────
  heading("SETUP: accounts");

  const adminEmail = `p0admin-${uid}@test.local`;
  const admin = await prisma.user.create({
    data: { email: adminEmail, password: await bcrypt.default.hash("Pass123!", 12), role: "ADMIN", schoolId: null },
  });
  log.push(`  ADMIN created: ${adminEmail}`);

  const regA = await (await fetch(`${BASE}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: `p0a-${uid}@test.local`, password: "Pass123!" }),
  })).json();
  const sidA = regA.schoolId;
  const emailA = regA.email;

  const regB = await (await fetch(`${BASE}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: `p0b-${uid}@test.local`, password: "Pass123!" }),
  })).json();
  const sidB = regB.schoolId;
  const emailB = regB.email;

  log.push(`  USER_A (school A): ${emailA} -> ${sidA}`);
  log.push(`  USER_B (school B): ${emailB} -> ${sidB}`);

  const cookieAdmin = await login(adminEmail, "Pass123!");
  const cookieA = await login(emailA, "Pass123!");
  const cookieB = await login(emailB, "Pass123!");
  if (!cookieAdmin || !cookieA || !cookieB) throw new Error("login failed");
  log.push("  All sessions obtained\n");

  // ── 1. ANONYMOUS ─────────────────────────────────────────
  heading("1. ANONYMOUS access");

  let r = await fetch(`${BASE}/api/students`);
  result("/api/students", "GET", r.status, null, "no session -> 401", 401);
  r = await fetch(`${BASE}/api/invoices`);
  result("/api/invoices", "GET", r.status, null, "no session -> 401", 401);
  r = await fetch(`${BASE}/api/admin-stats`);
  result("/api/admin-stats", "GET", r.status, null, "no session -> 401", 401);
  r = await fetch(`${BASE}/api/admin`);
  result("/api/admin", "GET", r.status, null, "no session -> 401", 401);
  r = await fetch(`${BASE}/api/grades`, { method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ schoolId: sidA, name: "Ghost", order: 99 }) });
  result("/api/grades", "POST", r.status, null, "no session mutation -> 401", 401);
  r = await fetch(`${BASE}/dashboard`, { redirect: "manual" });
  result("/dashboard", "GET", r.status, null, "no session page -> redirect (302/307)", 307);

  // ── 2. ADMIN capabilities ────────────────────────────────
  heading("2. ADMIN capabilities");

  r = await authed("/api/admin", {}, cookieAdmin);
  result("/api/admin", "GET", r.status, r.body, "admin platform stats", 200);
  r = await authed("/api/admin-stats", {}, cookieAdmin);
  result("/api/admin-stats", "GET", r.status, r.body, "admin platform stats", 200);

  // Admin seeds school A with one of every resource type
  subheading("Seed school A resources (as ADMIN)");
  let res, studentA, clientA, gradeA, yearA, classA, invoiceA;

  res = await authed("/api/students", { method: "POST", body: JSON.stringify({ schoolId: sidA, code: `S-A-${uid}`, firstName: "Alice", lastName: "A" }) }, cookieAdmin);
  studentA = res.body?.id; result("/api/students", "POST", res.status, res.body, "seed student in A", 201);

  res = await authed("/api/clients", { method: "POST", body: JSON.stringify({ schoolId: sidA, name: "Client A" }) }, cookieAdmin);
  clientA = res.body?.id; result("/api/clients", "POST", res.status, res.body, "seed client in A", 201);

  res = await authed("/api/grades", { method: "POST", body: JSON.stringify({ schoolId: sidA, name: "Grade A", order: 0 }) }, cookieAdmin);
  gradeA = res.body?.id; result("/api/grades", "POST", res.status, res.body, "seed grade in A", 201);

  res = await authed("/api/academic-years", { method: "POST", body: JSON.stringify({ schoolId: sidA, name: "AY 2026", startDate: "2026-01-01", endDate: "2026-12-31" }) }, cookieAdmin);
  yearA = res.body?.id; result("/api/academic-years", "POST", res.status, res.body, "seed academic year in A", 201);

  res = await authed("/api/classes", { method: "POST", body: JSON.stringify({ schoolId: sidA, gradeId: gradeA, academicYearId: yearA, name: "Class A", code: `CL-A-${uid}` }) }, cookieAdmin);
  classA = res.body?.id; result("/api/classes", "POST", res.status, res.body, "seed class in A", 201);

  res = await authed("/api/invoices", { method: "POST", body: JSON.stringify({ schoolId: sidA, clientId: clientA, amount: 100 }) }, cookieAdmin);
  invoiceA = res.body?.id; result("/api/invoices", "POST", res.status, res.body, "seed invoice in A", 201);

  // ── 3. USER A: own-school access + cross-tenant write block ──
  heading("3. USER (school A): own access, cross-tenant blocked");

  r = await authed("/api/students", {}, cookieA);
  result("/api/students", "GET", r.status, r.body, "A lists own students", 200);
  const leaked = r.body?.some((s) => s.schoolId !== sidA);
  if (leaked) { failCount++; log.push("  FAIL list contains foreign-school rows"); } else { passCount++; log.push("  PASS list contains only own school rows"); }

  subheading("USER A attempts to WRITE into school B");
  r = await authed("/api/students", { method: "POST", body: JSON.stringify({ schoolId: sidB, code: `X-${uid}`, firstName: "Eve", lastName: "B" }) }, cookieA);
  result("/api/students", "POST", r.status, r.body, "POST student into school B -> 403", 403);
  r = await authed("/api/clients", { method: "POST", body: JSON.stringify({ schoolId: sidB, name: "Evil" }) }, cookieA);
  result("/api/clients", "POST", r.status, r.body, "POST client into school B -> 403", 403);
  r = await authed("/api/grades", { method: "POST", body: JSON.stringify({ schoolId: sidB, name: "Evil", order: 1 }) }, cookieA);
  result("/api/grades", "POST", r.status, r.body, "POST grade into school B -> 403", 403);
  r = await authed("/api/academic-years", { method: "POST", body: JSON.stringify({ schoolId: sidB, name: "Evil", startDate: "2026-01-01", endDate: "2026-12-31" }) }, cookieA);
  result("/api/academic-years", "POST", r.status, r.body, "POST academic year into school B -> 403", 403);
  r = await authed("/api/classes", { method: "POST", body: JSON.stringify({ schoolId: sidB, gradeId: gradeA, academicYearId: yearA, name: "Evil", code: `EV-${uid}` }) }, cookieA);
  result("/api/classes", "POST", r.status, r.body, "POST class into school B -> 403", 403);
  r = await authed("/api/invoices", { method: "POST", body: JSON.stringify({ schoolId: sidB, clientId: clientA, amount: 1 }) }, cookieA);
  result("/api/invoices", "POST", r.status, r.body, "POST invoice into school B -> 403", 403);

  subheading("USER A cannot reach platform admin");
  r = await authed("/api/admin-stats", {}, cookieA);
  result("/api/admin-stats", "GET", r.status, r.body, "A -> admin stats 403", 403);
  r = await authed("/api/admin", {}, cookieA);
  result("/api/admin", "GET", r.status, r.body, "A -> admin 403", 403);
  r = await authed("/dashboard/admin", {}, cookieA);
  result("/dashboard/admin", "GET", r.status, null, "A -> admin page blocked (non-200)", 500);
  r = await authed("/api/schools", {}, cookieA);
  result("/api/schools", "GET", r.status, r.body, "A lists schools (own only)", 200);
  if (Array.isArray(r.body) && r.body.length === 1 && r.body[0].id === sidA) {
    passCount++; log.push("  PASS school list contains exactly own school");
  } else {
    failCount++; log.push(`  FAIL school list leaked (${JSON.stringify(r.body)?.slice(0, 120)})`);
  }
  r = await authed(`/api/schools/${sidB}`, {}, cookieA);
  result(`/api/schools/${sidB}`, "GET", r.status, r.body, "A reads school B -> 403", 403);

  // ── 4. USER B: IDOR attempts on school A resources ──────
  heading("4. USER B: IDOR attempts on school A resources (read + mutate)");

  const idor = [
    ["students", studentA, { firstName: "Hacked" }],
    ["clients", clientA, { name: "Hacked" }],
    ["grades", gradeA, { name: "Hacked" }],
    ["academic-years", yearA, { name: "Hacked" }],
    ["classes", classA, { name: "Hacked" }],
    ["invoices", invoiceA, { amount: 999 }],
  ];
  for (const [resource, id, patch] of idor) {
    r = await authed(`/api/${resource}/${id}`, {}, cookieB);
    result(`/api/${resource}/${id}`, "GET", r.status, r.body, `B reads A's ${resource} -> 403`, 403);
    r = await authed(`/api/${resource}/${id}`, { method: "PUT", body: JSON.stringify(patch) }, cookieB);
    result(`/api/${resource}/${id}`, "PUT", r.status, r.body, `B updates A's ${resource} -> 403`, 403);
    r = await authed(`/api/${resource}/${id}`, { method: "DELETE" }, cookieB);
    result(`/api/${resource}/${id}`, "DELETE", r.status, r.body, `B deletes A's ${resource} -> 403`, 403);
  }

  r = await authed(`/api/schools/${sidA}`, {}, cookieB);
  result(`/api/schools/${sidA}`, "GET", r.status, r.body, "B reads school A -> 403", 403);

  subheading("Server action route guard (school workspace)");
  r = await authed(`/dashboard/schools/${sidA}/users/new`, {}, cookieB);
  result(`/dashboard/schools/${sidA}/users/new`, "GET", r.status, null, "B reaches A's add-user page -> 404", 404);
  r = await authed(`/dashboard/schools/${sidA}/users`, {}, cookieB);
  result(`/dashboard/schools/${sidA}/users`, "GET", r.status, null, "B reaches A's users page -> 404", 404);

  // ── 5. ANALYTICS scoping ─────────────────────────────────
  heading("5. Analytics (school-scoped)");

  r = await authed("/dashboard/analytics", {}, cookieB);
  const htmlB = typeof r.body === "string" ? r.body : "";
  result("/dashboard/analytics", "GET", r.status, null, "B renders analytics page", 200);
  if (htmlB.includes("Alice")) {
    failCount++; log.push("  FAIL analytics page leaks school A student data");
  } else {
    passCount++; log.push("  PASS analytics page contains no school A data");
  }

  // ── 6. CLEANUP ───────────────────────────────────────────
  heading("6. Cleanup");

  await prisma.user.deleteMany({ where: { OR: [{ id: admin.id }, { email: emailA }, { email: emailB }] } });
  await prisma.invoice.deleteMany({ where: { schoolId: { in: [sidA, sidB] } } });
  await prisma.client.deleteMany({ where: { schoolId: { in: [sidA, sidB] } } });
  await prisma.school.deleteMany({ where: { id: { in: [sidA, sidB] } } });
  log.push("  Test accounts and schools removed");

  await prisma.$disconnect();
} catch (err) {
  log.push(`\n  ERROR: ${err.message}`);
  failCount++;
}

log.push(`\n${"=".repeat(70)}`);
log.push(`  RESULTS: ${passCount} passed, ${failCount} failed, ${testCount} total`);
log.push(`${"=".repeat(70)}`);
console.log(log.join("\n"));
process.exit(failCount === 0 ? 0 : 1);
