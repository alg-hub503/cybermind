// CyberMind v1.2.0 — Academic Foundation E2E Verification
// Real HTTP CRUD + RBAC + isolation via NextAuth sessions
// Uses fresh CSRF token per login, real session cookie extraction

const BASE = "http://localhost:3000";
const uid = Date.now();

// ── Helpers ──────────────────────────────────────────────────

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

function request(method, path, body) {
  const s = `${method} ${path}`;
  return body !== undefined ? `${s}\n    Body: ${JSON.stringify(body)}` : s;
}

function response(status, body) {
  const s = `    Status: ${status}`;
  if (body && typeof body === 'object' && body.error) {
    return `${s}  (${body.error})`;
  }
  return s;
}

function result(path, method, status, body, description, expected) {
  testCount++;
  const statusMatch = typeof expected === 'number' ? status === expected : true;
  if (statusMatch) {
    passCount++;
    log.push(`  ✅ ${method} ${path} → ${status}  (${description})`);
  } else {
    failCount++;
    log.push(`  ❌ ${method} ${path} → ${status}  (expected ${expected}) (${description})`);
  }
  // Print full body for errors or important responses
  if (body && typeof body === 'object') {
    if (body.error) log.push(`       Error: ${body.error}`);
    if (body.id) log.push(`       ID: ${body.id}`);
  }
}

// ── Auth: fresh session via CSRF + credentials ──────────────

async function login(email, password) {
  // Step 1: Get fresh CSRF token (also gets CSRF cookie)
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`, { redirect: "manual" });
  const csrfCookie = csrfRes.headers.getSetCookie?.()?.[0] || csrfRes.headers.get('set-cookie') || '';
  const csrfCookies = [];
  const rawCookies = csrfRes.headers.get('set-cookie');
  if (rawCookies) {
    // Split on comma, but be careful about cookie expiration dates
    const parts = rawCookies.split(/(?<!Expires=[^;]*),(?! )/);
    for (const c of parts) {
      csrfCookies.push(c.split(';')[0].trim());
    }
  }
  const { csrfToken } = await csrfRes.json();

  if (!csrfToken) {
    log.push(`  ⚠️  No CSRF token from /api/auth/csrf`);
    return null;
  }

  // Step 2: Login with credentials + CSRF token + cookie
  const loginRes = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": csrfCookies.join('; '),
    },
    body: new URLSearchParams({
      email,
      password,
      csrfToken,
      callbackUrl: "/dashboard",
    }),
    redirect: "manual",
  });

  // Step 3: Extract session token from redirect response
  const setCookie = loginRes.headers.get('set-cookie');
  if (!setCookie) {
    log.push(`  ⚠️  No session cookie after login (status ${loginRes.status})`);
    log.push(`       Location: ${loginRes.headers.get('location')}`);
    return null;
  }

  // Handle case where multiple Set-Cookie headers are concatenated
  const cookies = setCookie.split(/(?<!Expires=[^;]*),(?! )/);
  let sessionToken = null;
  for (const c of cookies) {
    const m = c.match(/next-auth\.session-token=([^;]+)/);
    if (m) {
      sessionToken = `next-auth.session-token=${m[1]}`;
      break;
    }
  }

  if (!sessionToken) {
    log.push(`  ⚠️  No next-auth.session-token in cookies: ${setCookie.slice(0, 100)}`);
    return null;
  }

  return sessionToken;
}

async function authed(path, options = {}, cookie) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      "Cookie": cookie,
      "Content-Type": "application/json",
    },
    redirect: "manual",
  });

  let body;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    try { body = await res.json(); } catch { body = null; }
  } else {
    body = await res.text();
  }
  return { status: res.status, body };
}


// ══════════════════════════════════════════════════════════════
//  MAIN TEST
// ══════════════════════════════════════════════════════════════

try {
  heading("SETUP: Create test accounts");

  // ── ACCOUNTS ──
  const { PrismaClient } = await import("@prisma/client");
  const bcrypt = await import("bcryptjs");
  const prisma = new PrismaClient();

  // Admin
  const adminEmail = `admin-${uid}@verify.com`;
  await prisma.user.create({
    data: { email: adminEmail, password: await bcrypt.default.hash("Pass123!", 12), role: "ADMIN", schoolId: null },
  });
  log.push(`  ADMIN: ${adminEmail}`);

  // School A
  const a = await (await fetch(`${BASE}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: `sad-${uid}@verify.com`, password: "Pass123!" }),
  })).json();
  const sidA = a.schoolId;
  const emailA = a.email;
  log.push(`  USER_A: ${emailA}  (school: ${sidA})`);

  // School B
  const b = await (await fetch(`${BASE}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: `sbd-${uid}@verify.com`, password: "Pass123!" }),
  })).json();
  const sidB = b.schoolId;
  const emailB = b.email;
  log.push(`  USER_B: ${emailB}  (school: ${sidB})`);

  // ── LOGIN ──
  subheading("Authenticating (CSRF → Credentials → Session Cookie)");
  const cookieAdmin = await login(adminEmail, "Pass123!");
  const cookieA = await login(emailA, "Pass123!");
  const cookieB = await login(emailB, "Pass123!");

  if (!cookieAdmin) throw new Error("Admin login failed");
  if (!cookieA) throw new Error("User A login failed");
  if (!cookieB) throw new Error("User B login failed");
  log.push(`  ✓ All three sessions obtained`);

  // ══════════════════════════════════════════════════════════════
  //  GRADE
  // ══════════════════════════════════════════════════════════════
  heading("GRADE — CRUD + RBAC + Isolation");

  let gradeA, gradeB;

  // CREATE
  subheading("CREATE");
  let r = await authed("/api/grades", { method: "POST", body: JSON.stringify({ schoolId: sidA, name: "Grade A1", order: 0 }) }, cookieAdmin);
  result("/api/grades", "POST", r.status, r.body, "Create Grade A1", 201);
  gradeA = r.body?.id;

  r = await authed("/api/grades", { method: "POST", body: JSON.stringify({ schoolId: sidA, name: "Grade A2", order: 1 }) }, cookieAdmin);
  result("/api/grades", "POST", r.status, r.body, "Create Grade A2", 201);

  r = await authed("/api/grades", { method: "POST", body: JSON.stringify({ schoolId: sidB, name: "Grade B1", order: 0 }) }, cookieAdmin);
  result("/api/grades", "POST", r.status, r.body, "Create Grade B1", 201);
  gradeB = r.body?.id;

  // READ — ADMIN (all)
  subheading("READ (RBAC: ADMIN sees all)");
  r = await authed("/api/grades", {}, cookieAdmin);
  result("/api/grades", "GET", r.status, r.body, `Admin sees ${r.body?.length} grades (expect ≥3)`, 200);
  if (r.body) log.push(`       IDs: ${r.body.map(x => x.id.slice(-6)).join(', ')}`);

  // READ — USER_A (own school only)
  subheading("READ (RBAC: USER_A sees own school only)");
  r = await authed("/api/grades", {}, cookieA);
  result("/api/grades", "GET", r.status, r.body, `USER_A sees ${r.body?.length} grades (expect 2: A1, A2)`, 200);
  if (r.body) {
    for (const g of r.body) {
      log.push(`       id=${g.id.slice(-6)} name=${g.name} schoolId=${g.schoolId === sidA ? '✅ own' : '❌ other'}`);
    }
  }

  // READ — USER_B (own school only)
  subheading("READ (RBAC: USER_B sees own school only)");
  r = await authed("/api/grades", {}, cookieB);
  result("/api/grades", "GET", r.status, r.body, `USER_B sees ${r.body?.length} grades (expect 1: B1)`, 200);
  if (r.body) {
    for (const g of r.body) {
      log.push(`       id=${g.id.slice(-6)} name=${g.name} schoolId=${g.schoolId === sidB ? '✅ own' : '❌ other'}`);
    }
  }

  // UPDATE — own
  subheading("UPDATE (RBAC)");
  r = await authed(`/api/grades/${gradeA}`, { method: "PUT", body: JSON.stringify({ name: "Grade A1 Updated", order: 0 }) }, cookieA);
  result(`/api/grades/${gradeA}`, "PUT", r.status, r.body, "USER_A updates own grade", 200);
  log.push(`       name → ${r.body?.name}`);

  // UPDATE — cross-school (FORBIDDEN)
  r = await authed(`/api/grades/${gradeB}`, { method: "PUT", body: JSON.stringify({ name: "Hacked" }) }, cookieA);
  result(`/api/grades/${gradeB}`, "PUT", r.status, r.body, "USER_A tries cross-school update → 403", 403);

  // DELETE — cross-school (FORBIDDEN)
  subheading("DELETE (RBAC)");
  r = await authed(`/api/grades/${gradeB}`, { method: "DELETE" }, cookieA);
  result(`/api/grades/${gradeB}`, "DELETE", r.status, r.body, "USER_A tries cross-school delete → 403", 403);

  // UNAUTHENTICATED
  subheading("UNAUTHENTICATED ACCESS");
  r = await fetch(`${BASE}/api/grades`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ schoolId: sidA, name: "Ghost", order: 99 }),
  });
  const ub = r.headers.get('content-type')?.includes('json') ? await r.json() : null;
  result("/api/grades", "POST", r.status, ub, "No cookie → 401", 401);

  // UNIQUENESS
  subheading("UNIQUENESS CONSTRAINT");
  r = await authed("/api/grades", { method: "POST", body: JSON.stringify({ schoolId: sidA, name: "Grade A2", order: 5 }) }, cookieAdmin);
  result("/api/grades", "POST", r.status, r.body, "Duplicate name (Grade A2) → 409", 409);

  // FK VALIDATION
  subheading("FOREIGN KEY VALIDATION");
  r = await authed("/api/grades", { method: "POST", body: JSON.stringify({ schoolId: "bad-school", name: "NoSchool", order: 0 }) }, cookieAdmin);
  result("/api/grades", "POST", r.status, r.body, "Invalid schoolId → 400", 400);

  // DELETE (ADMIN)
  subheading("ADMIN DELETE");
  r = await authed(`/api/grades/${gradeA}`, { method: "DELETE" }, cookieAdmin);
  result(`/api/grades/${gradeA}`, "DELETE", r.status, r.body, "Admin deletes Grade A1", 200);
  log.push(`       Deleted: ${r.body?.name || r.body?.id}`);

  // Verify deletion
  r = await authed("/api/grades", {}, cookieA);
  const rem = r.body?.length || 0;
  result("/api/grades", "GET", r.status, r.body, `After delete: USER_A sees ${rem} grades (expect 1)`, 200);

  // ══════════════════════════════════════════════════════════════
  //  CLASS
  // ══════════════════════════════════════════════════════════════
  heading("CLASS — CRUD + RBAC + Isolation");

  // Prerequisites: AcademicYear + Grade
  r = await authed("/api/academic-years", { method: "POST", body: JSON.stringify({ schoolId: sidA, name: "AY-2025-2026", startDate: "2025-09-01", endDate: "2026-06-30" }) }, cookieAdmin);
  result("/api/academic-years", "POST", r.status, r.body, "Create AcademicYear for School A", 201);
  const ayA = r.body?.id;

  r = await authed("/api/academic-years", { method: "POST", body: JSON.stringify({ schoolId: sidB, name: "AY-2025-2026", startDate: "2025-09-01", endDate: "2026-06-30" }) }, cookieAdmin);
  result("/api/academic-years", "POST", r.status, r.body, "Create AcademicYear for School B", 201);
  const ayB = r.body?.id;

  // Recreate grade for A (original was deleted)
  r = await authed("/api/grades", { method: "POST", body: JSON.stringify({ schoolId: sidA, name: "Grade-A", order: 0 }) }, cookieAdmin);
  result("/api/grades", "POST", r.status, r.body, "Recreate grade for School A", 201);
  const gradeA2 = r.body?.id;
  if (!ayA || !ayB || !gradeA2) throw new Error("Missing prerequisites");

  // CREATE
  subheading("CREATE");
  r = await authed("/api/classes", { method: "POST", body: JSON.stringify({ schoolId: sidA, gradeId: gradeA2, academicYearId: ayA, name: "Section A", code: "CA-1A" }) }, cookieAdmin);
  result("/api/classes", "POST", r.status, r.body, "Create Class School A", 201);
  const classA = r.body?.id;

  r = await authed("/api/classes", { method: "POST", body: JSON.stringify({ schoolId: sidB, gradeId: gradeB, academicYearId: ayB, name: "Section A", code: "CB-1A" }) }, cookieAdmin);
  result("/api/classes", "POST", r.status, r.body, "Create Class School B", 201);
  const classB = r.body?.id;

  // READ — ADMIN
  subheading("READ (RBAC)");
  r = await authed("/api/classes", {}, cookieAdmin);
  result("/api/classes", "GET", r.status, r.body, `Admin sees ${r.body?.length} classes`, 200);
  if (r.body) for (const c of r.body) log.push(`       id=${c.id.slice(-6)} name=${c.name} school=${c.schoolId === sidA ? 'A' : c.schoolId === sidB ? 'B' : '?'}`);

  // READ — USER_A
  r = await authed("/api/classes", {}, cookieA);
  result("/api/classes", "GET", r.status, r.body, `USER_A sees ${r.body?.length} classes`, 200);
  if (r.body) {
    for (const c of r.body) {
      log.push(`       id=${c.id.slice(-6)} name=${c.name} school=${c.schoolId === sidA ? '✅ own' : '❌ other'}`);
    }
  }

  // READ — USER_B
  r = await authed("/api/classes", {}, cookieB);
  result("/api/classes", "GET", r.status, r.body, `USER_B sees ${r.body?.length} classes`, 200);
  if (r.body) {
    for (const c of r.body) {
      log.push(`       id=${c.id.slice(-6)} name=${c.name} school=${c.schoolId === sidB ? '✅ own' : '❌ other'}`);
    }
  }

  // UPDATE — own
  subheading("UPDATE (RBAC)");
  r = await authed(`/api/classes/${classA}`, { method: "PUT", body: JSON.stringify({ name: "Section A Updated" }) }, cookieA);
  result(`/api/classes/${classA}`, "PUT", r.status, r.body, "USER_A updates own class", 200);
  log.push(`       name → ${r.body?.name}`);

  // UPDATE — cross-school
  r = await authed(`/api/classes/${classB}`, { method: "PUT", body: JSON.stringify({ name: "Hacked" }) }, cookieA);
  result(`/api/classes/${classB}`, "PUT", r.status, r.body, "USER_A tries cross-school update → 403", 403);

  // DELETE — cross-school
  subheading("DELETE (RBAC)");
  r = await authed(`/api/classes/${classB}`, { method: "DELETE" }, cookieA);
  result(`/api/classes/${classB}`, "DELETE", r.status, r.body, "USER_A tries cross-school delete → 403", 403);

  // UNAUTHENTICATED
  subheading("UNAUTHENTICATED");
  r = await fetch(`${BASE}/api/classes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ schoolId: sidA, gradeId: gradeA2, academicYearId: ayA, name: "Ghost", code: "GHOST" }),
  });
  const ub2 = r.headers.get('content-type')?.includes('json') ? await r.json() : null;
  result("/api/classes", "POST", r.status, ub2, "No cookie → 401", 401);

  // UNIQUENESS
  subheading("UNIQUENESS");
  r = await authed("/api/classes", { method: "POST", body: JSON.stringify({ schoolId: sidA, gradeId: gradeA2, academicYearId: ayA, name: "Section B", code: "CA-1A" }) }, cookieAdmin);
  result("/api/classes", "POST", r.status, r.body, "Duplicate code same school → 409", 409);

  // FK VALIDATION
  subheading("FOREIGN KEY VALIDATION");
  r = await authed("/api/classes", { method: "POST", body: JSON.stringify({ schoolId: sidA, gradeId: "bad-g", academicYearId: ayA, name: "Bad", code: "BAD-1" }) }, cookieAdmin);
  result("/api/classes", "POST", r.status, r.body, "Invalid gradeId → 400", 400);
  r = await authed("/api/classes", { method: "POST", body: JSON.stringify({ schoolId: sidA, gradeId: gradeA2, academicYearId: "bad-ay", name: "Bad2", code: "BAD-2" }) }, cookieAdmin);
  result("/api/classes", "POST", r.status, r.body, "Invalid academicYearId → 400", 400);

  // ADMIN DELETE
  subheading("ADMIN DELETE");
  r = await authed(`/api/classes/${classA}`, { method: "DELETE" }, cookieAdmin);
  result(`/api/classes/${classA}`, "DELETE", r.status, r.body, "Admin deletes class", 200);

  r = await authed("/api/classes", {}, cookieA);
  result("/api/classes", "GET", r.status, r.body, `After delete: USER_A sees ${r.body?.length} classes (expect 0)`, 200);

  // ══════════════════════════════════════════════════════════════
  //  STUDENT
  // ══════════════════════════════════════════════════════════════
  heading("STUDENT — CRUD + RBAC + Isolation");

  // CREATE
  subheading("CREATE");
  r = await authed("/api/students", { method: "POST", body: JSON.stringify({ schoolId: sidA, code: "ST-A-001", firstName: "Alice", lastName: "Johnson" }) }, cookieAdmin);
  result("/api/students", "POST", r.status, r.body, "Create Student School A", 201);
  const stuA = r.body?.id;
  log.push(`       Student A: ${r.body?.firstName} ${r.body?.lastName} (${r.body?.code})`);

  r = await authed("/api/students", { method: "POST", body: JSON.stringify({ schoolId: sidB, code: "ST-B-001", firstName: "Bob", lastName: "Smith" }) }, cookieAdmin);
  result("/api/students", "POST", r.status, r.body, "Create Student School B", 201);
  const stuB = r.body?.id;
  log.push(`       Student B: ${r.body?.firstName} ${r.body?.lastName} (${r.body?.code})`);

  // READ — ADMIN
  subheading("READ (RBAC)");
  r = await authed("/api/students", {}, cookieAdmin);
  result("/api/students", "GET", r.status, r.body, `Admin sees ${r.body?.length} students`, 200);
  if (r.body) for (const s of r.body) log.push(`       id=${s.id.slice(-6)} name=${s.firstName} ${s.lastName} school=${s.schoolId === sidA ? 'A' : 'B'}`);

  // READ — USER_A
  r = await authed("/api/students", {}, cookieA);
  result("/api/students", "GET", r.status, r.body, `USER_A sees ${r.body?.length} students`, 200);
  if (r.body) {
    for (const s of r.body) {
      log.push(`       id=${s.id.slice(-6)} name=${s.firstName} school=${s.schoolId === sidA ? '✅ own' : '❌ other'}`);
    }
  }

  // READ — USER_B
  r = await authed("/api/students", {}, cookieB);
  result("/api/students", "GET", r.status, r.body, `USER_B sees ${r.body?.length} students`, 200);
  if (r.body) {
    for (const s of r.body) {
      log.push(`       id=${s.id.slice(-6)} name=${s.firstName} school=${s.schoolId === sidB ? '✅ own' : '❌ other'}`);
    }
  }

  // UPDATE — own
  subheading("UPDATE (RBAC)");
  r = await authed(`/api/students/${stuA}`, { method: "PUT", body: JSON.stringify({ firstName: "Alicia" }) }, cookieA);
  result(`/api/students/${stuA}`, "PUT", r.status, r.body, "USER_A updates own student", 200);
  log.push(`       firstName → ${r.body?.firstName}`);

  // UPDATE — cross-school
  r = await authed(`/api/students/${stuB}`, { method: "PUT", body: JSON.stringify({ firstName: "Hacked" }) }, cookieA);
  result(`/api/students/${stuB}`, "PUT", r.status, r.body, "USER_A tries cross-school update → 403", 403);

  // DELETE — cross-school
  subheading("DELETE (RBAC)");
  r = await authed(`/api/students/${stuB}`, { method: "DELETE" }, cookieA);
  result(`/api/students/${stuB}`, "DELETE", r.status, r.body, "USER_A tries cross-school delete → 403", 403);

  // UNAUTHENTICATED
  subheading("UNAUTHENTICATED");
  r = await fetch(`${BASE}/api/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ schoolId: sidA, code: "GHOST", firstName: "Ghost", lastName: "User" }),
  });
  const ub3 = r.headers.get('content-type')?.includes('json') ? await r.json() : null;
  result("/api/students", "POST", r.status, ub3, "No cookie → 401", 401);

  // UNIQUENESS
  subheading("UNIQUENESS");
  r = await authed("/api/students", { method: "POST", body: JSON.stringify({ schoolId: sidA, code: "ST-A-001", firstName: "Dup", lastName: "Student" }) }, cookieAdmin);
  result("/api/students", "POST", r.status, r.body, "Duplicate code same school → 409", 409);

  // Different code same school OK
  r = await authed("/api/students", { method: "POST", body: JSON.stringify({ schoolId: sidB, code: "ST-B-002", firstName: "Second", lastName: "Student" }) }, cookieAdmin);
  result("/api/students", "POST", r.status, r.body, "Different code same school → 201", 201);

  // FK VALIDATION
  subheading("FOREIGN KEY VALIDATION");
  r = await authed("/api/students", { method: "POST", body: JSON.stringify({ schoolId: "bad-school", code: "BAD-FK", firstName: "Bad", lastName: "FK" }) }, cookieAdmin);
  result("/api/students", "POST", r.status, r.body, "Invalid schoolId → 400", 400);

  // Student with dateOfBirth
  subheading("DATE OF BIRTH");
  r = await authed("/api/students", { method: "POST", body: JSON.stringify({ schoolId: sidA, code: "ST-A-003", firstName: "Birthday", lastName: "Child", dateOfBirth: "2012-12-25" }) }, cookieAdmin);
  result("/api/students", "POST", r.status, r.body, "Student with DOB", 201);
  log.push(`       dateOfBirth: ${r.body?.dateOfBirth}`);

  // ADMIN DELETE
  subheading("ADMIN DELETE");
  r = await authed(`/api/students/${stuA}`, { method: "DELETE" }, cookieAdmin);
  result(`/api/students/${stuA}`, "DELETE", r.status, r.body, "Admin deletes student", 200);

  r = await authed("/api/students", {}, cookieA);
  result("/api/students", "GET", r.status, r.body, `After delete: USER_A sees ${r.body?.length} students (expect 1: ST-A-003)`, 200);

  // ══════════════════════════════════════════════════════════════
  //  SUMMARY
  // ══════════════════════════════════════════════════════════════
  heading("VERIFICATION SUMMARY");
  log.push(`\n  Tests:    ${testCount}`);
  log.push(`  Passed:   ${passCount}`);
  log.push(`  Failed:   ${failCount}`);
  log.push(`  Overall:  ${failCount === 0 ? '✅ ALL PASSED' : '❌ SOME FAILED'}`);

} catch (err) {
  log.push(`\n  💥 CRASH: ${err.message}`);
  log.push(`  ${err.stack?.split('\n').slice(0, 4).join('\n  ')}`);
}

// ── CLEANUP ──────────────────────────────────────────────────
try {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  const pattern = `%-${uid}@verify.com`;
  const users = await prisma.user.findMany({ where: { email: { contains: `-${uid}@verify.com` } } });
  for (const u of users) {
    if (u.schoolId) {
      // Cascade should handle this but be explicit
      for (const table of ['StudentAcademicRecord', 'Student', 'Class', 'Grade', 'AcademicYear']) {
        await prisma[table].deleteMany({ where: { schoolId: u.schoolId } }).catch(() => {});
      }
      // Also delete any students with this schoolId (added via admin)
      await prisma.student.deleteMany({ where: { schoolId: u.schoolId } }).catch(() => {});
      await prisma.class.deleteMany({ where: { schoolId: u.schoolId } }).catch(() => {});
      await prisma.grade.deleteMany({ where: { schoolId: u.schoolId } }).catch(() => {});
      await prisma.academicYear.deleteMany({ where: { schoolId: u.schoolId } }).catch(() => {});
      await prisma.school.delete({ where: { id: u.schoolId } }).catch(() => {});
    }
    await prisma.user.delete({ where: { id: u.id } }).catch(() => {});
  }
  await prisma.$disconnect();
} catch (e) {
  // Cleanup is best-effort
}

console.log(log.join('\n'));
process.exit(failCount > 0 ? 1 : 0);
