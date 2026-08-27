import { login, type LoginResult } from "./auth";

const BASE_URL = "https://cybermind-rosy.vercel.app";

async function api(
  method: string,
  path: string,
  auth: LoginResult,
  body?: any
): Promise<{ status: number; data: any }> {
  const headers: Record<string, string> = {
    Cookie: auth.cookieHeader,
  };
  if (body) {
    headers["Content-Type"] = "application/json";
  }
  
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  
  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  
  return { status: res.status, data };
}

// Test results
const results: { test: string; pass: boolean; detail: string }[] = [];

function assert(test: string, condition: boolean, detail: string) {
  results.push({ test, pass: condition, detail });
  console.log(`  ${condition ? "✅" : "❌"} ${test}: ${detail}`);
}

async function main() {
  console.log("=== API TESTS: School-Scoped Roles ===\n");

  // Login all users
  console.log("Logging in...");
  let schoolAdmin: LoginResult;
  let teacher: LoginResult;
  let platformAdmin: LoginResult;
  
  try {
    schoolAdmin = await login("upgrade@test.com", "123456");
    console.log("  ✅ School ADMIN logged in");
  } catch (e: any) {
    console.log(`  ❌ School ADMIN login failed: ${e.message}`);
    return;
  }
  
  try {
    teacher = await login("rachid52@gmail.com", "123456");
    console.log("  ✅ Teacher logged in");
  } catch (e: any) {
    console.log(`  ❌ Teacher login failed: ${e.message}`);
    return;
  }
  
  try {
    platformAdmin = await login("algrhd8@gmail.com", "03031970");
    console.log("  ✅ Platform ADMIN logged in");
  } catch (e: any) {
    console.log(`  ❌ Platform ADMIN login failed: ${e.message}`);
    return;
  }

  // Get school IDs using platform admin
  const schoolsRes = await api("GET", "/api/schools", platformAdmin);
  const schools = Array.isArray(schoolsRes.data) ? schoolsRes.data : [];
  console.log(`\nFound ${schools.length} schools`);
  
  const upgradeSchool = schools.find((s: any) => s.name?.toLowerCase().includes("upgrade"));
  const nehahSchool = schools.find((s: any) => s.name?.includes("نجاح"));

  if (!upgradeSchool || !nehahSchool) {
    console.log("❌ Could not find test schools:", schools.map((s: any) => s.name));
    return;
  }

  const schoolA = upgradeSchool.id;
  const schoolB = nehahSchool.id;

  console.log(`School A (upgrade): ${schoolA}`);
  console.log(`School B (nehah): ${schoolB}\n`);

  // ============================================================
  // TEST 1: School ADMIN role management
  // ============================================================
  console.log("TEST 1: School ADMIN role management");

  const getRoles = await api("GET", `/api/schools/${schoolA}/roles`, schoolAdmin);
  assert("GET roles", getRoles.status === 200, `Status: ${getRoles.status}`);

  const createRole = await api("POST", `/api/schools/${schoolA}/roles`, schoolAdmin, {
    name: "ACCOUNTANT",
    description: "Accountant role",
  });
  assert("Create Role", createRole.status === 201, `Status: ${createRole.status}`);
  const newRoleId = createRole.data?.id;

  if (newRoleId) {
    const updateRole = await api("PUT", `/api/schools/${schoolA}/roles/${newRoleId}`, schoolAdmin, {
      name: "SENIOR_ACCOUNTANT",
      description: "Senior accountant",
    });
    assert("Update Role", updateRole.status === 200, `Status: ${updateRole.status}`);
  }

  if (newRoleId) {
    const perms = await api("GET", `/api/schools/${schoolA}/permissions`, schoolAdmin);
    const permIds = perms.data?.slice(0, 2).map((p: any) => p.id) || [];
    const updatePerms = await api("PUT", `/api/schools/${schoolA}/roles/${newRoleId}`, schoolAdmin, {
      permissionIds: permIds,
    });
    assert("Update permissions", updatePerms.status === 200, `Status: ${updatePerms.status}`);
  }

  if (newRoleId) {
    const deleteRole = await api("DELETE", `/api/schools/${schoolA}/roles/${newRoleId}`, schoolAdmin);
    assert("Delete unassigned Role", deleteRole.status === 200, `Status: ${deleteRole.status}`);
  }

  const adminRole = getRoles.data?.find((r: any) => r.systemKey === "SCHOOL_ADMIN");
  if (adminRole) {
    const deleteAdmin = await api("DELETE", `/api/schools/${schoolA}/roles/${adminRole.id}`, schoolAdmin);
    assert("Delete SCHOOL_ADMIN blocked", deleteAdmin.status === 400, `Status: ${deleteAdmin.status}`);
  }

  const crossSchool = await api("GET", `/api/schools/${schoolB}/roles`, schoolAdmin);
  assert("Cross-school access blocked", crossSchool.status === 403, `Status: ${crossSchool.status}`);

  console.log("");

  // ============================================================
  // TEST 2: Cross-school isolation
  // ============================================================
  console.log("TEST 2: Cross-school isolation");

  const aReadsB = await api("GET", `/api/schools/${schoolB}/roles`, schoolAdmin);
  assert("School A cannot read School B roles", aReadsB.status === 403, `Status: ${aReadsB.status}`);

  const aCreatesInB = await api("POST", `/api/schools/${schoolB}/roles`, schoolAdmin, {
    name: "HACKER",
  });
  assert("School A cannot create in School B", aCreatesInB.status === 403, `Status: ${aCreatesInB.status}`);

  console.log("");

  // ============================================================
  // TEST 3: Role deletion with assigned users
  // ============================================================
  console.log("TEST 3: Role deletion with assigned users");

  // The SCHOOL_ADMIN role in School A has upgrade@test.com assigned
  // It should be blocked by BOTH protections: SCHOOL_ADMIN + assigned users
  const schoolAdminRole = getRoles.data?.find((r: any) => r.systemKey === "SCHOOL_ADMIN");
  if (schoolAdminRole) {
    const deleteAdminRole = await api("DELETE", `/api/schools/${schoolA}/roles/${schoolAdminRole.id}`, schoolAdmin);
    assert("Delete role with users blocked", deleteAdminRole.status === 400, `Status: ${deleteAdminRole.status}`);
  }

  // Also test: create role, no users, should succeed
  const tempRole = await api("POST", `/api/schools/${schoolA}/roles`, schoolAdmin, {
    name: "TEMP_DELETE_TEST",
  });
  if (tempRole.data?.id) {
    const deleteTemp = await api("DELETE", `/api/schools/${schoolA}/roles/${tempRole.data.id}`, schoolAdmin);
    assert("Delete unassigned role succeeds", deleteTemp.status === 200, `Status: ${deleteTemp.status}`);
  }

  console.log("");

  // ============================================================
  // TEST 4: Platform ADMIN
  // ============================================================
  console.log("TEST 4: Platform ADMIN access");

  const paReadsA = await api("GET", `/api/schools/${schoolA}/roles`, platformAdmin);
  assert("Platform ADMIN can read School A", paReadsA.status === 200, `Status: ${paReadsA.status}`);

  const paReadsB = await api("GET", `/api/schools/${schoolB}/roles`, platformAdmin);
  assert("Platform ADMIN can read School B", paReadsB.status === 200, `Status: ${paReadsB.status}`);

  const paCreate = await api("POST", `/api/schools/${schoolA}/roles`, platformAdmin, {
    name: "PA_TEST_ROLE",
    description: "Created by Platform ADMIN",
  });
  assert("Platform ADMIN can create role", paCreate.status === 201, `Status: ${paCreate.status}`);

  if (paCreate.data?.id) {
    const paDelete = await api("DELETE", `/api/schools/${schoolA}/roles/${paCreate.data.id}`, platformAdmin);
    assert("Platform ADMIN can delete role", paDelete.status === 200, `Status: ${paDelete.status}`);
  }

  console.log("");

  // ============================================================
  // TEST 5: Regular user (Teacher)
  // ============================================================
  console.log("TEST 5: Regular user access denied");

  const teacherReads = await api("GET", `/api/schools/${schoolB}/roles`, teacher);
  assert("Teacher cannot read roles", teacherReads.status === 403, `Status: ${teacherReads.status}`);

  const teacherCreates = await api("POST", `/api/schools/${schoolB}/roles`, teacher, {
    name: "UNAUTHORIZED",
  });
  assert("Teacher cannot create roles", teacherCreates.status === 403, `Status: ${teacherCreates.status}`);

  console.log("");

  // ============================================================
  // TEST 6: Registration creates default roles
  // ============================================================
  console.log("TEST 6: Registration creates default roles");

  const testEmail = `test-roles-${Date.now()}@test.com`;
  const regRes = await fetch(`${BASE_URL}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: "TestPassword123!",
      name: "Roles Test",
    }),
  });
  const regData = await regRes.json();
  assert("Registration succeeds", regRes.status === 200, `Status: ${regRes.status}`);

  if (regData.schoolId) {
    try {
      const newUser = await login(testEmail, "TestPassword123!");
      console.log("  ✅ New user logged in");
      
      const newRoles = await api("GET", `/api/schools/${regData.schoolId}/roles`, newUser);
      assert("New school has roles", newRoles.status === 200, `Status: ${newRoles.status}`);
      
      const roleNames = newRoles.data?.map((r: any) => r.systemKey).sort();
      assert("Has SCHOOL_ADMIN", roleNames?.includes("SCHOOL_ADMIN"), `Roles: ${roleNames?.join(", ")}`);
      assert("Has TEACHER", roleNames?.includes("TEACHER"), `Roles: ${roleNames?.join(", ")}`);
      assert("Has STAFF", roleNames?.includes("STAFF"), `Roles: ${roleNames?.join(", ")}`);
      
      const adminRole = newRoles.data?.find((r: any) => r.systemKey === "SCHOOL_ADMIN");
      assert("SCHOOL_ADMIN has permissions", (adminRole?.RolePermission?.length || 0) > 0, `Permissions: ${adminRole?.RolePermission?.length || 0}`);
    } catch (e: any) {
      assert("New user login", false, e.message);
    }
  }

  // ============================================================
  // SUMMARY
  // ============================================================
  console.log("\n=== TEST SUMMARY ===");
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  console.log(`Passed: ${passed}/${results.length}`);
  if (failed > 0) {
    console.log(`Failed: ${failed}`);
    for (const r of results.filter(r => !r.pass)) {
      console.log(`  ❌ ${r.test}: ${r.detail}`);
    }
  }
}

main().catch(console.error);
