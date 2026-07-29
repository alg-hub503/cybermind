// CyberMind v1.2.0 — Academic Foundation E2E Verification
// Tests Grade, Class, Student via real HTTP + NextAuth sessions

const BASE = "http://localhost:3000";
const uid = Date.now();

const results = [];
const assertions = { total: 0, passed: 0, failed: 0 };
let allPassed = true;

function assert(cond, msg) {
  assertions.total++;
  if (cond) { assertions.passed++; results.push(`  ✅ ${msg}`); }
  else { assertions.failed++; results.push(`  ❌ ${msg}`); allPassed = false; }
}

async function fetchAPI(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, { ...options, redirect: "manual" });
  let body;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) try { body = await res.json(); } catch { body = null; }
  else body = await res.text();
  return { status: res.status, body };
}

async function loginAs(email, password) {
  // Fresh CSRF + login per call
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`);
  const csrfCookies = [];
  for (const [k, v] of csrfRes.headers) if (k === 'set-cookie') {
    for (const c of v.split(',')) csrfCookies.push(c.split(';')[0].trim());
  }
  const { csrfToken } = await csrfRes.json();

  const loginRes = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "Cookie": csrfCookies.join('; ') },
    body: new URLSearchParams({ email, password, csrfToken, callbackUrl: "/dashboard" }),
    redirect: "manual",
  });

  // Extract session cookie
  let sessionCookie = null;
  for (const [k, v] of loginRes.headers) if (k === 'set-cookie') {
    const m = v.match(/next-auth\.session-token=([^;]+)/);
    if (m) sessionCookie = `next-auth.session-token=${m[1]}`;
  }
  return sessionCookie;
}

async function authed(path, options = {}, sessionCookie) {
  return fetchAPI(path, {
    ...options,
    headers: { ...options.headers, "Cookie": sessionCookie, "Content-Type": "application/json" },
  });
}

try {
  results.push("=".repeat(70));
  results.push("  CYBERMIND v1.2.0 — ACADEMIC FOUNDATION E2E VERIFICATION");
  results.push("  Grade · Class · Student — CRUD + RBAC + Isolation via Real HTTP");
  results.push("=".repeat(70));

  // ── SETUP ────────────────────────────────────────────────────
  results.push("\n" + "-".repeat(50));
  results.push("  SETUP: Create Admin + Register School A + School B");
  results.push("-".repeat(50));

  // Admin user
  const adminEmail = `admin-${uid}@test.com`;
  const adminPass = "AdminPass123!";
  const { PrismaClient } = await import("@prisma/client");
  const bcrypt = await import("bcryptjs");
  const prisma = new PrismaClient();
  const adminHash = await bcrypt.default.hash(adminPass, 12);
  await prisma.user.create({ data: { email: adminEmail, password: adminHash, role: "ADMIN", schoolId: null } });
  results.push(`   Admin created: ${adminEmail}`);

  // School A + USER_A
  const emailA = `schoola-${uid}@test.com`;
  let r = await fetchAPI("/api/register", { method: "POST", body: JSON.stringify({ email: emailA, password: "Test123!" }) });
  if (r.status !== 200) throw new Error(`Register School A failed: ${r.body?.error || r.status}`);
  const schoolAId = r.body.schoolId;
  results.push(`   School A: ${schoolAId}, user: ${emailA}`);

  // School B + USER_B
  const emailB = `schoolb-${uid}@test.com`;
  r = await fetchAPI("/api/register", { method: "POST", body: JSON.stringify({ email: emailB, password: "Test123!" }) });
  if (r.status !== 200) throw new Error(`Register School B failed: ${r.body?.error || r.status}`);
  const schoolBId = r.body.schoolId;
  results.push(`   School B: ${schoolBId}, user: ${emailB}`);

  // Login as all three
  const sessionA = await loginAs(emailA, "Test123!");
  const sessionB = await loginAs(emailB, "Test123!");
  const sessionAdmin = await loginAs(adminEmail, adminPass);
  assert(!!sessionA, "USER_A session obtained");
  assert(!!sessionB, "USER_B session obtained");
  assert(!!sessionAdmin, "ADMIN session obtained");

  // ══════════════════════════════════════════════════════════════
  //  GRADE
  // ══════════════════════════════════════════════════════════════
  results.push("\n" + "═".repeat(60));
  results.push("  GRADE — CRUD + RBAC + ISOLATION");
  results.push("═".repeat(60));

  let gradeA, gradeB;

  // ADMIN: CREATE
  let g = await authed("/api/grades", { method: "POST", body: JSON.stringify({ schoolId: schoolAId, name: "G1", order: 0 }) }, sessionAdmin);
  results.push(`\nADMIN POST /api/grades (School A) → ${g.status}`);
  assert(g.status === 201, "Create grade 201");
  assert(g.body?.name === "G1", "Grade name matches");
  assert(g.body?.schoolId === schoolAId, "Grade schoolId matches");
  gradeA = g.body?.id;

  g = await authed("/api/grades", { method: "POST", body: JSON.stringify({ schoolId: schoolAId, name: "G2", order: 1 }) }, sessionAdmin);
  results.push(`ADMIN POST /api/grades (School A G2) → ${g.status}`);
  assert(g.status === 201, "Create grade G2 201");

  g = await authed("/api/grades", { method: "POST", body: JSON.stringify({ schoolId: schoolBId, name: "G1", order: 0 }) }, sessionAdmin);
  results.push(`ADMIN POST /api/grades (School B) → ${g.status}`);
  assert(g.status === 201, "Create School B grade 201");
  gradeB = g.body?.id;

  // ADMIN: GET all
  g = await authed("/api/grades", {}, sessionAdmin);
  results.push(`ADMIN GET /api/grades → ${g.status} (${g.body?.length} grades)`);
  assert(g.status === 200, "List all grades 200");
  assert(g.body.length >= 3, `Sees all grades (${g.body.length})`);

  // USER_A: GET (own school only)
  g = await authed("/api/grades", {}, sessionA);
  results.push(`USER_A GET /api/grades → ${g.status} (${g.body?.length} grades)`);
  assert(g.status === 200, "USER_A list 200");
  assert(g.body.length === 2, `School A has 2 grades (${g.body.length})`);
  assert(g.body.every(x => x.schoolId === schoolAId), "USER_A only sees own school");

  // USER_B: GET (own school only)
  g = await authed("/api/grades", {}, sessionB);
  results.push(`USER_B GET /api/grades → ${g.status} (${g.body?.length} grades)`);
  assert(g.status === 200, "USER_B list 200");
  assert(g.body.length === 1, `School B has 1 grade (${g.body.length})`);
  assert(g.body.every(x => x.schoolId === schoolBId), "USER_B only sees own school");

  // USER_A: UPDATE own grade
  g = await authed(`/api/grades/${gradeA}`, { method: "PUT", body: JSON.stringify({ name: "G1 Updated", order: 0 }) }, sessionA);
  results.push(`USER_A PUT /api/grades/${gradeA} → ${g.status}`);
  assert(g.status === 200, "Update own grade 200");
  assert(g.body?.name === "G1 Updated", "Name updated");

  // USER_A: UPDATE cross-school (should fail)
  g = await authed(`/api/grades/${gradeB}`, { method: "PUT", body: JSON.stringify({ name: "Hacked" }) }, sessionA);
  results.push(`USER_A PUT /api/grades/${gradeB} (cross-school) → ${g.status}`);
  assert(g.status === 403, "Cross-school update forbidden (403)");

  // USER_A: DELETE cross-school (should fail)
  g = await authed(`/api/grades/${gradeB}`, { method: "DELETE" }, sessionA);
  results.push(`USER_A DELETE /api/grades/${gradeB} (cross-school) → ${g.status}`);
  assert(g.status === 403, "Cross-school delete forbidden (403)");

  // UNAUTHENTICATED
  g = await fetchAPI("/api/grades", { method: "POST", body: JSON.stringify({ schoolId: schoolAId, name: "X", order: 9 }) });
  results.push(`UNAUTH POST /api/grades → ${g.status}`);
  assert(g.status === 401, "Unauthenticated 401");

  // DUPLICATE name same school
  g = await authed("/api/grades", { method: "POST", body: JSON.stringify({ schoolId: schoolAId, name: "G2", order: 5 }) }, sessionAdmin);
  results.push(`ADMIN POST duplicate grade name → ${g.status}`);
  assert(g.status === 409, "Duplicate grade name 409");

  // INVALID FK
  g = await authed("/api/grades", { method: "POST", body: JSON.stringify({ schoolId: "bad-id", name: "Bad", order: 0 }) }, sessionAdmin);
  results.push(`ADMIN POST invalid schoolId → ${g.status}`);
  assert(g.status === 400, "Invalid schoolId FK 400");

  // ADMIN: DELETE
  g = await authed(`/api/grades/${gradeA}`, { method: "DELETE" }, sessionAdmin);
  results.push(`ADMIN DELETE /api/grades/${gradeA} → ${g.status}`);
  assert(g.status === 200, "Admin delete 200");

  // Verify deletion
  g = await authed("/api/grades", {}, sessionA);
  results.push(`USER_A GET after delete → ${g.body?.length} grades`);
  assert(g.body.length === 1, "Only 1 grade remains in School A");
  assert(g.body.every(x => x.id !== gradeA), "Deleted grade absent");

  // ══════════════════════════════════════════════════════════════
  //  CLASS
  // ══════════════════════════════════════════════════════════════
  results.push("\n" + "═".repeat(60));
  results.push("  CLASS — CRUD + RBAC + ISOLATION");
  results.push("═".repeat(60));

  // Setup prerequisites: AcademicYear + Grade for Class FK
  let ay = await authed("/api/academic-years", { method: "POST", body: JSON.stringify({ schoolId: schoolAId, name: "2025-2026", startDate: "2025-09-01", endDate: "2026-06-30" }) }, sessionAdmin);
  results.push(`ADMIN POST AcademicYear School A → ${ay.status}`);
  const ayAId = ay.body?.id;
  assert(!!ayAId, "AcademicYear A created");

  ay = await authed("/api/academic-years", { method: "POST", body: JSON.stringify({ schoolId: schoolBId, name: "2025-2026", startDate: "2025-09-01", endDate: "2026-06-30" }) }, sessionAdmin);
  const ayBId = ay.body?.id;

  // Recreate a grade for School A (original was deleted)
  g = await authed("/api/grades", { method: "POST", body: JSON.stringify({ schoolId: schoolAId, name: "Grade 1", order: 0 }) }, sessionAdmin);
  const gradeA2 = g.body?.id;
  assert(!!gradeA2, "Recreated School A grade for Class tests");

  let c;

  // ADMIN: CREATE Class School A
  c = await authed("/api/classes", { method: "POST", body: JSON.stringify({ schoolId: schoolAId, gradeId: gradeA2, academicYearId: ayAId, name: "Section A", code: "1A" }) }, sessionAdmin);
  results.push(`\nADMIN POST /api/classes (School A) → ${c.status}`);
  assert(c.status === 201, "Create class 201");
  assert(c.body?.name === "Section A", "Class name matches");
  assert(c.body?.schoolId === schoolAId, "Class schoolId matches");
  const classAId = c.body?.id;

  // ADMIN: CREATE Class School B
  c = await authed("/api/classes", { method: "POST", body: JSON.stringify({ schoolId: schoolBId, gradeId: gradeB, academicYearId: ayBId, name: "Section A", code: "1A" }) }, sessionAdmin);
  results.push(`ADMIN POST /api/classes (School B) → ${c.status}`);
  assert(c.status === 201, "Create School B class 201");
  const classBId = c.body?.id;

  // ADMIN: GET all
  c = await authed("/api/classes", {}, sessionAdmin);
  results.push(`ADMIN GET /api/classes → ${c.status} (${c.body?.length})`);
  assert(c.status === 200, "List all classes 200");
  assert(c.body.length >= 2, `Sees all classes (${c.body.length})`);

  // USER_A: GET (own only)
  c = await authed("/api/classes", {}, sessionA);
  results.push(`USER_A GET /api/classes → ${c.status} (${c.body?.length})`);
  assert(c.status === 200, "USER_A list 200");
  assert(c.body.every(x => x.schoolId === schoolAId), "USER_A only sees own school");

  // USER_B: GET (own only)
  c = await authed("/api/classes", {}, sessionB);
  results.push(`USER_B GET /api/classes → ${c.status} (${c.body?.length})`);
  assert(c.status === 200, "USER_B list 200");
  assert(c.body.every(x => x.schoolId === schoolBId), "USER_B only sees own school");

  // USER_A: UPDATE own
  c = await authed(`/api/classes/${classAId}`, { method: "PUT", body: JSON.stringify({ name: "Section A Updated" }) }, sessionA);
  results.push(`USER_A PUT /api/classes/${classAId} → ${c.status}`);
  assert(c.status === 200, "Update own class 200");
  assert(c.body?.name === "Section A Updated", "Name updated");

  // Cross-school
  c = await authed(`/api/classes/${classBId}`, { method: "PUT", body: JSON.stringify({ name: "Hacked" }) }, sessionA);
  results.push(`USER_A PUT cross-school class → ${c.status}`);
  assert(c.status === 403, "Cross-school update forbidden");

  c = await authed(`/api/classes/${classBId}`, { method: "DELETE" }, sessionA);
  results.push(`USER_A DELETE cross-school class → ${c.status}`);
  assert(c.status === 403, "Cross-school delete forbidden");

  // Unauthenticated
  c = await fetchAPI("/api/classes", { method: "POST", body: JSON.stringify({ schoolId: schoolAId, gradeId: gradeA2, academicYearId: ayAId, name: "X", code: "X" }) });
  results.push(`UNAUTH POST /api/classes → ${c.status}`);
  assert(c.status === 401, "Unauthenticated 401");

  // Duplicate code
  c = await authed("/api/classes", { method: "POST", body: JSON.stringify({ schoolId: schoolAId, gradeId: gradeA2, academicYearId: ayAId, name: "Sec B", code: "1A" }) }, sessionAdmin);
  results.push(`ADMIN POST duplicate class code → ${c.status}`);
  assert(c.status === 409, "Duplicate code 409");

  // Invalid FK (gradeId)
  c = await authed("/api/classes", { method: "POST", body: JSON.stringify({ schoolId: schoolAId, gradeId: "bad-id", academicYearId: ayAId, name: "Bad", code: "BAD" }) }, sessionAdmin);
  results.push(`ADMIN POST invalid gradeId → ${c.status}`);
  assert(c.status === 400, "Invalid gradeId FK 400");

  // Invalid FK (academicYearId)
  c = await authed("/api/classes", { method: "POST", body: JSON.stringify({ schoolId: schoolAId, gradeId: gradeA2, academicYearId: "bad-id", name: "Bad2", code: "BAD2" }) }, sessionAdmin);
  results.push(`ADMIN POST invalid academicYearId → ${c.status}`);
  assert(c.status === 400, "Invalid academicYearId FK 400");

  // ADMIN: DELETE
  c = await authed(`/api/classes/${classAId}`, { method: "DELETE" }, sessionAdmin);
  results.push(`ADMIN DELETE /api/classes/${classAId} → ${c.status}`);
  assert(c.status === 200, "Admin delete class 200");

  // Verify
  c = await authed("/api/classes", {}, sessionA);
  results.push(`USER_A GET after class delete → ${c.body?.length} classes`);
  assert(c.body.every(x => x.id !== classAId), "Deleted class absent");

  // ══════════════════════════════════════════════════════════════
  //  STUDENT
  // ══════════════════════════════════════════════════════════════
  results.push("\n" + "═".repeat(60));
  results.push("  STUDENT — CRUD + RBAC + ISOLATION");
  results.push("═".repeat(60));

  let s;

  // ADMIN: CREATE Student School A
  s = await authed("/api/students", { method: "POST", body: JSON.stringify({ schoolId: schoolAId, code: "STU001", firstName: "John", lastName: "Doe", dateOfBirth: null }) }, sessionAdmin);
  results.push(`\nADMIN POST /api/students (School A) → ${s.status}`);
  assert(s.status === 201, "Create student 201");
  assert(s.body?.firstName === "John", "First name matches");
  assert(s.body?.schoolId === schoolAId, "Student schoolId matches");
  const studentAId = s.body?.id;

  // ADMIN: CREATE Student School B
  s = await authed("/api/students", { method: "POST", body: JSON.stringify({ schoolId: schoolBId, code: "STU001", firstName: "Jane", lastName: "Smith", dateOfBirth: "2010-05-15" }) }, sessionAdmin);
  results.push(`ADMIN POST /api/students (School B) → ${s.status}`);
  assert(s.status === 201, "Create School B student 201");
  const studentBId = s.body?.id;

  // ADMIN: GET all
  s = await authed("/api/students", {}, sessionAdmin);
  results.push(`ADMIN GET /api/students → ${s.status} (${s.body?.length})`);
  assert(s.status === 200, "List all students 200");
  assert(s.body.length >= 2, `Sees all students (${s.body.length})`);

  // USER_A: GET (own only)
  s = await authed("/api/students", {}, sessionA);
  results.push(`USER_A GET /api/students → ${s.status} (${s.body?.length})`);
  assert(s.status === 200, "USER_A list 200");
  assert(s.body.every(x => x.schoolId === schoolAId), "USER_A only sees own school");

  // USER_B: GET (own only)
  s = await authed("/api/students", {}, sessionB);
  results.push(`USER_B GET /api/students → ${s.status} (${s.body?.length})`);
  assert(s.status === 200, "USER_B list 200");
  assert(s.body.every(x => x.schoolId === schoolBId), "USER_B only sees own school");

  // USER_A: UPDATE own
  s = await authed(`/api/students/${studentAId}`, { method: "PUT", body: JSON.stringify({ firstName: "Johnny" }) }, sessionA);
  results.push(`USER_A PUT /api/students/${studentAId} → ${s.status}`);
  assert(s.status === 200, "Update own student 200");
  assert(s.body?.firstName === "Johnny", "First name updated");

  // Cross-school
  s = await authed(`/api/students/${studentBId}`, { method: "PUT", body: JSON.stringify({ firstName: "Hacked" }) }, sessionA);
  results.push(`USER_A PUT cross-school student → ${s.status}`);
  assert(s.status === 403, "Cross-school update forbidden");

  s = await authed(`/api/students/${studentBId}`, { method: "DELETE" }, sessionA);
  results.push(`USER_A DELETE cross-school student → ${s.status}`);
  assert(s.status === 403, "Cross-school delete forbidden");

  // Unauthenticated
  s = await fetchAPI("/api/students", { method: "POST", body: JSON.stringify({ schoolId: schoolAId, code: "UNAUTH", firstName: "Bad", lastName: "User", dateOfBirth: null }) });
  results.push(`UNAUTH POST /api/students → ${s.status}`);
  assert(s.status === 401, "Unauthenticated 401");

  // Duplicate code same school
  s = await authed("/api/students", { method: "POST", body: JSON.stringify({ schoolId: schoolAId, code: "STU001", firstName: "Dup", lastName: "Student", dateOfBirth: null }) }, sessionAdmin);
  results.push(`ADMIN POST duplicate student code → ${s.status}`);
  assert(s.status === 409, "Duplicate student code 409");

  // Different code same school OK
  s = await authed("/api/students", { method: "POST", body: JSON.stringify({ schoolId: schoolBId, code: "STU002", firstName: "Second", lastName: "Student", dateOfBirth: "2011-01-01" }) }, sessionAdmin);
  results.push(`ADMIN POST different student code School B → ${s.status}`);
  assert(s.status === 201, "Different code OK");

  // Invalid FK
  s = await authed("/api/students", { method: "POST", body: JSON.stringify({ schoolId: "bad-school", code: "BADFK", firstName: "Bad", lastName: "FK", dateOfBirth: null }) }, sessionAdmin);
  results.push(`ADMIN POST invalid schoolId → ${s.status}`);
  assert(s.status === 400, "Invalid schoolId FK 400");

  // Student with dateOfBirth
  s = await authed("/api/students", { method: "POST", body: JSON.stringify({ schoolId: schoolAId, code: "STU003", firstName: "Birthday", lastName: "Child", dateOfBirth: "2012-12-25" }) }, sessionAdmin);
  results.push(`ADMIN POST student with dateOfBirth → ${s.status}`);
  assert(s.status === 201, "Student with DOB created");

  // ADMIN: DELETE
  s = await authed(`/api/students/${studentAId}`, { method: "DELETE" }, sessionAdmin);
  results.push(`ADMIN DELETE /api/students/${studentAId} → ${s.status}`);
  assert(s.status === 200, "Admin delete student 200");

  // Verify
  s = await authed("/api/students", {}, sessionA);
  results.push(`USER_A GET after student delete → ${s.body?.length} students`);
  assert(s.body.every(x => x.id !== studentAId), "Deleted student absent");

  // ── SUMMARY ──────────────────────────────────────────────────
  results.push("\n" + "═".repeat(60));
  results.push("  VERIFICATION SUMMARY");
  results.push("═".repeat(60));
  results.push(`\n  Total assertions: ${assertions.total}`);
  results.push(`  Passed:           ${assertions.passed}`);
  results.push(`  Failed:           ${assertions.failed}`);
  results.push(`  Overall:          ${allPassed ? "✅ ALL PASSED" : "❌ SOME FAILED"}`);

} catch (err) {
  results.push(`\n❌ CRASH: ${err.message}`);
  allPassed = false;
}

console.log(results.join("\n"));

// Cleanup test data
try {
  const { execSync } = await import("child_process");
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  const testPattern = `%-${uid}@test.com`;
  const users = await prisma.user.findMany({ where: { email: { contains: `-${uid}@test.com` } } });
  for (const u of users) {
    if (u.schoolId) {
      await prisma.studentAcademicRecord.deleteMany({ where: { schoolId: u.schoolId } }).catch(() => {});
      await prisma.student.deleteMany({ where: { schoolId: u.schoolId } }).catch(() => {});
      await prisma.class.deleteMany({ where: { schoolId: u.schoolId } }).catch(() => {});
      await prisma.grade.deleteMany({ where: { schoolId: u.schoolId } }).catch(() => {});
      await prisma.academicYear.deleteMany({ where: { schoolId: u.schoolId } }).catch(() => {});
      await prisma.school.delete({ where: { id: u.schoolId } }).catch(() => {});
    }
    await prisma.user.delete({ where: { id: u.id } }).catch(() => {});
  }
  await prisma.$disconnect();
} catch (e) {}

process.exit(allPassed ? 0 : 1);
