// CyberMind v1.2.0 — Academic Foundation Verification
// Tests Grade, Class, Student CRUD + RBAC + isolation via real HTTP + NextAuth sessions

const BASE = "http://localhost:3000";

// Test data
const SCHOOL_A = { email: "school_a_test@cybermind.test", password: "TestPass123!" };
const SCHOOL_B = { email: "school_b_test@cybermind.test", password: "TestPass123!" };
const ADMIN_ACCOUNT = { email: "admin_test@cybermind.test", password: "AdminPass123!" };

let cookieJar = {};
let schoolAId = null, schoolBId = null;
let allPassed = true;
const assertions = { total: 0, passed: 0, failed: 0 };
const results = [];

function assert(condition, label) {
  assertions.total++;
  if (condition) { assertions.passed++; results.push(`  ✅ ${label}`); }
  else { assertions.failed++; results.push(`  ❌ ${label}`); allPassed = false; }
}

async function fetchAPI(path, options = {}) {
  const url = `${BASE}${path}`;
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (cookieJar.cookie) headers["Cookie"] = cookieJar.cookie;
  const res = await fetch(url, { ...options, headers, redirect: "manual" });
  const setCookie = res.headers.get("set-cookie");
  if (setCookie) cookieJar.cookie = setCookie.split(";")[0];
  let body;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) try { body = await res.json(); } catch { body = null; }
  else body = await res.text();
  return { status: res.status, statusText: res.statusText, body };
}

function log(label, result, expectedStatus = null) {
  const pass = expectedStatus === null || result.status === expectedStatus;
  const icon = pass ? "✅" : "❌";
  if (!pass) allPassed = false;
  const s = `\n${icon} ${label}\n   Status: ${result.status} ${result.statusText}${expectedStatus !== null ? ` (expected ${expectedStatus})` : ""}`;
  const b = typeof result.body === "object" && result.body !== null
    ? `\n   Body: ${JSON.stringify(result.body, null, 2).split("\n").join("\n          ")}`
    : typeof result.body === "string" && result.body.length > 0
      ? `\n   Body: ${result.body.substring(0, 300)}` : "";
  results.push(s + b);
}

async function login(email, password) {
  // Step 1: Fetch CSRF token and capture all cookies
  let csrfRes = await fetch(`${BASE}/api/auth/csrf`);
  let allCookies = [];
  for (let [key, val] of csrfRes.headers) {
    if (key.toLowerCase() === 'set-cookie') {
      // Multiple set-cookie may be comma-joined
      let parts = val.split(',').map(s => s.trim());
      for (let p of parts) {
        allCookies.push(p.split(';')[0]);
      }
    }
  }
  let csrfData = await csrfRes.json();
  let csrfToken = csrfData.csrfToken;
  if (!csrfToken) throw new Error("Failed to get CSRF token");

  // Step 2: Login with credentials + captured cookies
  let cookieStr = allCookies.join('; ');
  const res = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": cookieStr
    },
    body: new URLSearchParams({ email, password, csrfToken, callbackUrl: "/dashboard" }),
    redirect: "manual",
  });

  // Capture all cookies from login response
  let sessionCookies = [];
  for (let [key, val] of res.headers) {
    if (key.toLowerCase() === 'set-cookie') {
      let parts = val.split(',').map(s => s.trim());
      for (let p of parts) {
        sessionCookies.push(p.split(';')[0]);
      }
    }
  }
  cookieJar.cookie = sessionCookies.join('; ');

  let bodyText;
  try { bodyText = await res.text(); } catch { bodyText = ""; }
  return { status: res.status, body: bodyText };
}

// ── Run ────────────────────────────────────────────────────────────────────
try {
  results.push("=".repeat(70));
  results.push("  CYBERMIND v1.2.0 — ACADEMIC FOUNDATION VERIFICATION");
  results.push("  Grade · Class · Student — CRUD + RBAC + Isolation");
  results.push("=".repeat(70));

  // ── SETUP: Create ADMIN user (via Prisma, since no "create admin" API) ──
  results.push("\n" + "-".repeat(50));
  results.push("  SETUP: Create ADMIN user");
  results.push("-".repeat(50));

  const { execSync } = await import("child_process");
  const runPrisma = (code) => {
    const escaped = code.replace(/"/g, '\\"');
    return execSync(`node -e "${escaped}"`, { cwd: process.cwd(), timeout: 10000 }).toString().trim();
  };

  runPrisma(`
    const { PrismaClient } = require("@prisma/client");
    const bcrypt = require("bcryptjs");
    const p = new PrismaClient();
    (async () => {
      const existing = await p.user.findUnique({ where: { email: "${ADMIN_ACCOUNT.email}" } });
      if (!existing) {
        const hash = await bcrypt.hash("${ADMIN_ACCOUNT.password}", 12);
        await p.user.create({ data: { email: "${ADMIN_ACCOUNT.email}", password: hash, role: "ADMIN", schoolId: null } });
      }
      await p.\$disconnect();
    })();
  `);
  results.push("   ADMIN user ready");

  // ── STEP 1: Register School A + USER_A ──────────────────────────────────
  results.push("\n" + "-".repeat(50));
  results.push("  STEP 1: Register School A + USER_A");
  results.push("-".repeat(50));

  let r1 = await fetchAPI("/api/register", { method: "POST", body: JSON.stringify(SCHOOL_A) });
  log("Register School A", r1, 200);
  if (r1.body?.schoolId) {
    schoolAId = r1.body.schoolId;
  } else {
    // Already exists — look up via Prisma
    const data = runPrisma(`
      const { PrismaClient } = require("@prisma/client");
      const p = new PrismaClient();
      (async () => {
        const u = await p.user.findUnique({ where: { email: "${SCHOOL_A.email}" }, include: { school: true } });
        console.log(JSON.stringify({ schoolId: u?.schoolId }));
        await p.\$disconnect();
      })();
    `);
    schoolAId = JSON.parse(data).schoolId;
  }
  assert(!!schoolAId, `School A ID exists (${schoolAId})`);

  // ── STEP 2: Register School B + USER_B ──────────────────────────────────
  results.push("\n" + "-".repeat(50));
  results.push("  STEP 2: Register School B + USER_B");
  results.push("-".repeat(50));

  let r2 = await fetchAPI("/api/register", { method: "POST", body: JSON.stringify(SCHOOL_B) });
  log("Register School B", r2, 200);
  if (r2.body?.schoolId) {
    schoolBId = r2.body.schoolId;
  } else {
    const data = runPrisma(`
      const { PrismaClient } = require("@prisma/client");
      const p = new PrismaClient();
      (async () => {
        const u = await p.user.findUnique({ where: { email: "${SCHOOL_B.email}" }, include: { school: true } });
        console.log(JSON.stringify({ schoolId: u?.schoolId }));
        await p.\$disconnect();
      })();
    `);
    schoolBId = JSON.parse(data).schoolId;
  }
  assert(!!schoolBId, `School B ID exists (${schoolBId})`);
  results.push(`\n   School A ID: ${schoolAId}`);
  results.push(`   School B ID: ${schoolBId}`);

  // ══════════════════════════════════════════════════════════════════════════
  //  GRADE TESTS
  // ══════════════════════════════════════════════════════════════════════════
  results.push("\n" + "═".repeat(60));
  results.push("  GRADE — CRUD + RBAC + ISOLATION");
  results.push("═".repeat(60));

  let gradeAId = null, gradeBId = null;

  // ADMIN: Create grade for School A
  await login(ADMIN_ACCOUNT.email, ADMIN_ACCOUNT.password);
  let g1 = await fetchAPI("/api/grades", { method: "POST", body: JSON.stringify({ schoolId: schoolAId, name: "Grade 1", order: 0 }) });
  log("ADMIN create Grade for School A", g1, 201);
  assert(g1.status === 201, "ADMIN create grade returns 201");
  assert(g1.body?.name === "Grade 1", "Grade name matches");
  assert(g1.body?.schoolId === schoolAId, "Grade schoolId matches");
  gradeAId = g1.body?.id;
  assert(!!gradeAId, "Grade A has an ID");

  // ADMIN: Create another grade for School A
  let g1b = await fetchAPI("/api/grades", { method: "POST", body: JSON.stringify({ schoolId: schoolAId, name: "Grade 2", order: 1 }) });
  log("ADMIN create Grade 2 for School A", g1b, 201);

  // ADMIN: Create grade for School B
  let g2 = await fetchAPI("/api/grades", { method: "POST", body: JSON.stringify({ schoolId: schoolBId, name: "Grade 1", order: 0 }) });
  log("ADMIN create Grade for School B", g2, 201);
  assert(!!g2.body?.id, "Grade B has an ID");
  gradeBId = g2.body?.id;

  // ADMIN: GET all grades
  let gAll = await fetchAPI("/api/grades");
  log("ADMIN GET all grades", gAll, 200);
  assert(Array.isArray(gAll.body), "Returns array");
  assert(gAll.body.length >= 3, `Sees grades across schools (${gAll.body.length} >= 3)`);

  // USER_A: GET (own school only)
  await login(SCHOOL_A.email, SCHOOL_A.password);
  let gUserA = await fetchAPI("/api/grades");
  log("USER_A GET grades", gUserA, 200);
  assert(gUserA.body.every(g => g.schoolId === schoolAId), "USER_A only sees School A grades");

  // USER_B: GET (own school only)
  await login(SCHOOL_B.email, SCHOOL_B.password);
  let gUserB = await fetchAPI("/api/grades");
  log("USER_B GET grades", gUserB, 200);
  assert(gUserB.body.every(g => g.schoolId === schoolBId), "USER_B only sees School B grades");
  assert(gUserB.body.length === 1, "School B has 1 grade");

  // USER_A: UPDATE own grade
  await login(SCHOOL_A.email, SCHOOL_A.password);
  let gUpd = await fetchAPI(`/api/grades/${gradeAId}`, { method: "PUT", body: JSON.stringify({ name: "Grade 1 Updated", order: 0 }) });
  log("USER_A UPDATE own grade", gUpd, 200);
  assert(gUpd.body?.name === "Grade 1 Updated", "Name updated");

  // USER_A: UPDATE cross-school grade (should fail)
  let gCrossUpd = await fetchAPI(`/api/grades/${gradeBId}`, { method: "PUT", body: JSON.stringify({ name: "Hacked" }) });
  log("USER_A UPDATE School B's grade (expect 403)", gCrossUpd, 403);
  assert(gCrossUpd.status === 403, "Cross-school update forbidden");

  // USER_A: DELETE cross-school (should fail)
  let gCrossDel = await fetchAPI(`/api/grades/${gradeBId}`, { method: "DELETE" });
  log("USER_A DELETE School B's grade (expect 403)", gCrossDel, 403);
  assert(gCrossDel.status === 403, "Cross-school delete forbidden");

  // Unauthenticated
  cookieJar.cookie = "";
  let gUnauth = await fetchAPI("/api/grades", { method: "POST", body: JSON.stringify({ schoolId: schoolAId, name: "Unauth", order: 99 }) });
  log("UNAUTHENTICATED create grade (expect 401)", gUnauth, 401);
  assert(gUnauth.status === 401, "Unauthenticated returns 401");

  // Duplicate name in same school
  await login(ADMIN_ACCOUNT.email, ADMIN_ACCOUNT.password);
  let gDup = await fetchAPI("/api/grades", { method: "POST", body: JSON.stringify({ schoolId: schoolAId, name: "Grade 2", order: 2 }) });
  log("ADMIN create duplicate grade name same school (expect 409)", gDup, 409);
  assert(gDup.status === 409, "Duplicate name returns 409");

  // Same name in different school OK
  let gDupOther = await fetchAPI("/api/grades", { method: "POST", body: JSON.stringify({ schoolId: schoolBId, name: "Grade 2", order: 1 }) });
  log("ADMIN create same name different school (expect 201)", gDupOther, 201);
  assert(gDupOther.status === 201, "Same name different school OK");
  if (gDupOther.body?.id) await fetchAPI(`/api/grades/${gDupOther.body.id}`, { method: "DELETE" });

  // Invalid FK
  let gBadFK = await fetchAPI("/api/grades", { method: "POST", body: JSON.stringify({ schoolId: "nonexistent-id", name: "Bad FK", order: 5 }) });
  log("ADMIN create grade with invalid schoolId (expect 400)", gBadFK, 400);
  assert(gBadFK.status === 400, "Invalid FK returns 400");

  // ADMIN: DELETE
  await login(ADMIN_ACCOUNT.email, ADMIN_ACCOUNT.password);
  let gDel = await fetchAPI(`/api/grades/${gradeAId}`, { method: "DELETE" });
  log("ADMIN DELETE grade", gDel, 200);
  assert(gDel.status === 200, "Admin delete returns 200");

  // Verify deletion
  await login(SCHOOL_A.email, SCHOOL_A.password);
  let gAfter = await fetchAPI("/api/grades");
  log("USER_A GET after deletion", gAfter, 200);
  assert(gAfter.body.every(g => g.id !== gradeAId), "Deleted grade absent");

  // ══════════════════════════════════════════════════════════════════════════
  //  CLASS TESTS
  // ══════════════════════════════════════════════════════════════════════════
  results.push("\n" + "═".repeat(60));
  results.push("  CLASS — CRUD + RBAC + ISOLATION");
  results.push("═".repeat(60));

  let academicYearAId = null, academicYearBId = null;
  let newGradeAId = null, classAId = null, classBId = null;

  await login(ADMIN_ACCOUNT.email, ADMIN_ACCOUNT.password);

  // Create AcademicYear for School A
  let ayA = await fetchAPI("/api/academic-years", { method: "POST", body: JSON.stringify({ schoolId: schoolAId, name: "2025-2026", startDate: "2025-09-01", endDate: "2026-06-30" }) });
  log("ADMIN create AcademicYear School A", ayA, 201);
  academicYearAId = ayA.body?.id;
  assert(!!academicYearAId, "AcademicYear A created");

  // Create AcademicYear for School B
  let ayB = await fetchAPI("/api/academic-years", { method: "POST", body: JSON.stringify({ schoolId: schoolBId, name: "2025-2026", startDate: "2025-09-01", endDate: "2026-06-30" }) });
  log("ADMIN create AcademicYear School B", ayB, 201);
  academicYearBId = ayB.body?.id;
  assert(!!academicYearBId, "AcademicYear B created");

  // Recreate a grade for School A (the original was deleted)
  let gNewA = await fetchAPI("/api/grades", { method: "POST", body: JSON.stringify({ schoolId: schoolAId, name: "Grade 1", order: 0 }) });
  log("ADMIN recreate grade for School A", gNewA, 201);
  newGradeAId = gNewA.body?.id;
  assert(!!newGradeAId, "Recreated grade for Class tests");

  // ADMIN: Create Class for School A
  let c1 = await fetchAPI("/api/classes", { method: "POST", body: JSON.stringify({ schoolId: schoolAId, gradeId: newGradeAId, academicYearId: academicYearAId, name: "Section A", code: "1A" }) });
  log("ADMIN create Class for School A", c1, 201);
  assert(c1.status === 201, "ADMIN create class returns 201");
  assert(c1.body?.name === "Section A", "Class name matches");
  assert(c1.body?.schoolId === schoolAId, "Class schoolId matches");
  classAId = c1.body?.id;
  assert(!!classAId, "Class A has ID");

  // ADMIN: Create Class for School B
  let c2 = await fetchAPI("/api/classes", { method: "POST", body: JSON.stringify({ schoolId: schoolBId, gradeId: gradeBId, academicYearId: academicYearBId, name: "Section A", code: "1A" }) });
  log("ADMIN create Class for School B", c2, 201);
  classBId = c2.body?.id;
  assert(!!classBId, "Class B has ID");

  // ADMIN: GET all classes
  let cAll = await fetchAPI("/api/classes");
  log("ADMIN GET all classes", cAll, 200);
  assert(Array.isArray(cAll.body), "Returns array");
  assert(cAll.body.length >= 2, `Sees all classes (${cAll.body.length})`);

  // USER_A: GET (own only)
  await login(SCHOOL_A.email, SCHOOL_A.password);
  let cUserA = await fetchAPI("/api/classes");
  log("USER_A GET classes", cUserA, 200);
  assert(cUserA.body.every(c => c.schoolId === schoolAId), "USER_A only sees School A classes");

  // USER_B: GET (own only)
  await login(SCHOOL_B.email, SCHOOL_B.password);
  let cUserB = await fetchAPI("/api/classes");
  log("USER_B GET classes", cUserB, 200);
  assert(cUserB.body.every(c => c.schoolId === schoolBId), "USER_B only sees School B classes");

  // USER_A: UPDATE own class
  await login(SCHOOL_A.email, SCHOOL_A.password);
  let cUpd = await fetchAPI(`/api/classes/${classAId}`, { method: "PUT", body: JSON.stringify({ name: "Section A Updated" }) });
  log("USER_A UPDATE own class", cUpd, 200);
  assert(cUpd.body?.name === "Section A Updated", "Class name updated");

  // USER_A: UPDATE cross-school (should fail)
  let cCrossUpd = await fetchAPI(`/api/classes/${classBId}`, { method: "PUT", body: JSON.stringify({ name: "Hacked" }) });
  log("USER_A UPDATE School B's class (expect 403)", cCrossUpd, 403);
  assert(cCrossUpd.status === 403, "Cross-school class update forbidden");

  // USER_A: DELETE cross-school (should fail)
  let cCrossDel = await fetchAPI(`/api/classes/${classBId}`, { method: "DELETE" });
  log("USER_A DELETE School B's class (expect 403)", cCrossDel, 403);
  assert(cCrossDel.status === 403, "Cross-school class delete forbidden");

  // Unauthenticated
  cookieJar.cookie = "";
  let cUnauth = await fetchAPI("/api/classes", { method: "POST", body: JSON.stringify({ schoolId: schoolAId, gradeId: newGradeAId, academicYearId: academicYearAId, name: "X", code: "X" }) });
  log("UNAUTHENTICATED create class (expect 401)", cUnauth, 401);
  assert(cUnauth.status === 401, "Unauthenticated returns 401");

  // Duplicate code same school
  await login(ADMIN_ACCOUNT.email, ADMIN_ACCOUNT.password);
  let cDup = await fetchAPI("/api/classes", { method: "POST", body: JSON.stringify({ schoolId: schoolAId, gradeId: newGradeAId, academicYearId: academicYearAId, name: "Section B", code: "1A" }) });
  log("ADMIN create duplicate class code same school (expect 409)", cDup, 409);
  assert(cDup.status === 409, "Duplicate class code returns 409");

  // Invalid gradeId FK
  let cBadG = await fetchAPI("/api/classes", { method: "POST", body: JSON.stringify({ schoolId: schoolAId, gradeId: "bad-id", academicYearId: academicYearAId, name: "Bad Grade", code: "BG" }) });
  log("ADMIN create class with invalid gradeId (expect 400)", cBadG, 400);
  assert(cBadG.status === 400, "Invalid gradeId FK returns 400");

  // Invalid academicYearId FK
  let cBadAY = await fetchAPI("/api/classes", { method: "POST", body: JSON.stringify({ schoolId: schoolAId, gradeId: newGradeAId, academicYearId: "bad-id", name: "Bad AY", code: "BAY" }) });
  log("ADMIN create class with invalid academicYearId (expect 400)", cBadAY, 400);
  assert(cBadAY.status === 400, "Invalid academicYearId FK returns 400");

  // ADMIN: DELETE
  await login(ADMIN_ACCOUNT.email, ADMIN_ACCOUNT.password);
  let cDel = await fetchAPI(`/api/classes/${classAId}`, { method: "DELETE" });
  log("ADMIN DELETE class", cDel, 200);
  assert(cDel.status === 200, "Admin delete class returns 200");

  // Verify
  await login(SCHOOL_A.email, SCHOOL_A.password);
  let cAfter = await fetchAPI("/api/classes");
  log("USER_A GET after deletion", cAfter, 200);
  assert(cAfter.body.every(c => c.id !== classAId), "Deleted class absent");

  // ══════════════════════════════════════════════════════════════════════════
  //  STUDENT TESTS
  // ══════════════════════════════════════════════════════════════════════════
  results.push("\n" + "═".repeat(60));
  results.push("  STUDENT — CRUD + RBAC + ISOLATION");
  results.push("═".repeat(60));

  let studentAId = null, studentBId = null;

  await login(ADMIN_ACCOUNT.email, ADMIN_ACCOUNT.password);

  // ADMIN: Create Student in School A
  let s1 = await fetchAPI("/api/students", { method: "POST", body: JSON.stringify({ schoolId: schoolAId, code: "STU001", firstName: "John", lastName: "Doe", dateOfBirth: null }) });
  log("ADMIN create Student School A", s1, 201);
  assert(s1.status === 201, "ADMIN create student returns 201");
  assert(s1.body?.firstName === "John", "First name matches");
  assert(s1.body?.schoolId === schoolAId, "Student schoolId matches");
  studentAId = s1.body?.id;
  assert(!!studentAId, "Student A has ID");

  // ADMIN: Create Student in School B
  let s2 = await fetchAPI("/api/students", { method: "POST", body: JSON.stringify({ schoolId: schoolBId, code: "STU001", firstName: "Jane", lastName: "Smith", dateOfBirth: "2010-05-15" }) });
  log("ADMIN create Student School B", s2, 201);
  studentBId = s2.body?.id;
  assert(!!studentBId, "Student B has ID");

  // ADMIN: GET all students
  let sAll = await fetchAPI("/api/students");
  log("ADMIN GET all students", sAll, 200);
  assert(Array.isArray(sAll.body), "Returns array");
  assert(sAll.body.length >= 2, `Sees all students (${sAll.body.length})`);

  // USER_A: GET (own only)
  await login(SCHOOL_A.email, SCHOOL_A.password);
  let sUserA = await fetchAPI("/api/students");
  log("USER_A GET students", sUserA, 200);
  assert(sUserA.body.every(s => s.schoolId === schoolAId), "USER_A only sees School A students");

  // USER_B: GET (own only)
  await login(SCHOOL_B.email, SCHOOL_B.password);
  let sUserB = await fetchAPI("/api/students");
  log("USER_B GET students", sUserB, 200);
  assert(sUserB.body.every(s => s.schoolId === schoolBId), "USER_B only sees School B students");

  // USER_A: UPDATE own student
  await login(SCHOOL_A.email, SCHOOL_A.password);
  let sUpd = await fetchAPI(`/api/students/${studentAId}`, { method: "PUT", body: JSON.stringify({ firstName: "Johnny" }) });
  log("USER_A UPDATE own student", sUpd, 200);
  assert(sUpd.body?.firstName === "Johnny", "Student name updated");

  // USER_A: UPDATE cross-school student (should fail)
  let sCrossUpd = await fetchAPI(`/api/students/${studentBId}`, { method: "PUT", body: JSON.stringify({ firstName: "Hacked" }) });
  log("USER_A UPDATE School B's student (expect 403)", sCrossUpd, 403);
  assert(sCrossUpd.status === 403, "Cross-school student update forbidden");

  // USER_A: DELETE cross-school student (should fail)
  let sCrossDel = await fetchAPI(`/api/students/${studentBId}`, { method: "DELETE" });
  log("USER_A DELETE School B's student (expect 403)", sCrossDel, 403);
  assert(sCrossDel.status === 403, "Cross-school student delete forbidden");

  // Unauthenticated
  cookieJar.cookie = "";
  let sUnauth = await fetchAPI("/api/students", { method: "POST", body: JSON.stringify({ schoolId: schoolAId, code: "UNAUTH", firstName: "Bad", lastName: "User", dateOfBirth: null }) });
  log("UNAUTHENTICATED create student (expect 401)", sUnauth, 401);
  assert(sUnauth.status === 401, "Unauthenticated returns 401");

  // Duplicate code same school
  await login(ADMIN_ACCOUNT.email, ADMIN_ACCOUNT.password);
  let sDup = await fetchAPI("/api/students", { method: "POST", body: JSON.stringify({ schoolId: schoolAId, code: "STU001", firstName: "Dup", lastName: "Student", dateOfBirth: null }) });
  log("ADMIN create duplicate student code same school (expect 409)", sDup, 409);
  assert(sDup.status === 409, "Duplicate student code returns 409");

  // Same code different school OK
  let sDupOther = await fetchAPI("/api/students", { method: "POST", body: JSON.stringify({ schoolId: schoolBId, code: "STU002", firstName: "Second", lastName: "Student", dateOfBirth: "2011-01-01" }) });
  log("ADMIN create different code School B (expect 201)", sDupOther, 201);
  assert(sDupOther.status === 201, "Different code same school OK");
  if (sDupOther.body?.id) await fetchAPI(`/api/students/${sDupOther.body.id}`, { method: "DELETE" });

  // Invalid schoolId FK
  let sBadFK = await fetchAPI("/api/students", { method: "POST", body: JSON.stringify({ schoolId: "bad-school", code: "BADFK", firstName: "Bad", lastName: "FK", dateOfBirth: null }) });
  log("ADMIN create student with invalid schoolId (expect 400)", sBadFK, 400);
  assert(sBadFK.status === 400, "Invalid schoolId FK returns 400");

  // Student with dateOfBirth
  let sWithDOB = await fetchAPI("/api/students", { method: "POST", body: JSON.stringify({ schoolId: schoolAId, code: "STU003", firstName: "Birthday", lastName: "Child", dateOfBirth: "2012-12-25" }) });
  log("ADMIN create student with dateOfBirth", sWithDOB, 201);
  assert(sWithDOB.status === 201, "Student with DOB created");
  if (sWithDOB.body?.id) await fetchAPI(`/api/students/${sWithDOB.body.id}`, { method: "DELETE" });

  // ADMIN: DELETE
  await login(ADMIN_ACCOUNT.email, ADMIN_ACCOUNT.password);
  let sDel = await fetchAPI(`/api/students/${studentAId}`, { method: "DELETE" });
  log("ADMIN DELETE student", sDel, 200);
  assert(sDel.status === 200, "Admin delete student returns 200");

  // Verify
  await login(SCHOOL_A.email, SCHOOL_A.password);
  let sAfter = await fetchAPI("/api/students");
  log("USER_A GET after deletion", sAfter, 200);
  assert(sAfter.body.every(s => s.id !== studentAId), "Deleted student absent");

} catch (err) {
  results.push(`\n❌ CRASH: ${err.message}`);
  allPassed = false;
}

// ── Summary ────────────────────────────────────────────────────────────────
results.push("\n" + "═".repeat(60));
results.push("  VERIFICATION SUMMARY");
results.push("═".repeat(60));
results.push(`\n  Total assertions: ${assertions.total}`);
results.push(`  Passed:           ${assertions.passed}`);
results.push(`  Failed:           ${assertions.failed}`);
results.push(`  Overall:          ${allPassed ? "✅ ALL PASSED" : "❌ SOME FAILED"}`);

console.log(results.join("\n"));

// Cleanup
try {
  const { execSync } = await import("child_process");
  execSync(`node -e "const {PrismaClient}=require('@prisma/client');const p=new PrismaClient();(async()=>{const testEmails=['${SCHOOL_A.email}','${SCHOOL_B.email}','${ADMIN_ACCOUNT.email}'];for(const e of testEmails){const u=await p.user.findUnique({where:{email:e}});if(u&&u.schoolId){await p.studentAcademicRecord.deleteMany({where:{schoolId:u.schoolId}}).catch(()=>{});await p.student.deleteMany({where:{schoolId:u.schoolId}}).catch(()=>{});await p.class.deleteMany({where:{schoolId:u.schoolId}}).catch(()=>{});await p.grade.deleteMany({where:{schoolId:u.schoolId}}).catch(()=>{});await p.academicYear.deleteMany({where:{schoolId:u.schoolId}}).catch(()=>{});await p.school.delete({where:{id:u.schoolId}}).catch(()=>{});}if(u)await p.user.delete({where:{email:e}}).catch(()=>{});}console.log('cleanup done');await p.\$disconnect();})()"`, { cwd: process.cwd(), timeout: 15000 });
} catch (e) {}

process.exit(allPassed ? 0 : 1);
