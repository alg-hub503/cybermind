// Test if getToken from next-auth/jwt works with a plain cookies object
const BASE = "http://localhost:3000";

// Create a simple endpoint test
async function main() {
  // First login
  let r1 = await fetch(`${BASE}/api/auth/csrf`);
  let c1 = [];
  for (let [k,v] of r1.headers) if (k === 'set-cookie') c1.push(v.split(',').flat().map(x => x.split(';')[0].trim()));
  let csrfCookies = c1.flat();
  let j1 = await r1.json();

  // Create user
  const { PrismaClient } = await import("@prisma/client");
  const bcrypt = await import("bcryptjs");
  const prisma = new PrismaClient();
  const hash = await bcrypt.default.hash("testit", 12);
  const school = await prisma.school.create({ data: { name: "Wrapper Test" } });
  const user = await prisma.user.create({
    data: { email: "wrapper-test@test.com", password: hash, schoolId: school.id, role: "USER" }
  });
  console.log(`User created: ${user.email}, school: ${school.id}`);

  // Login
  let r2 = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "Cookie": csrfCookies.join('; ') },
    body: new URLSearchParams({ email: "wrapper-test@test.com", password: "testit", csrfToken: j1.csrfToken, callbackUrl: "/dashboard" }),
    redirect: "manual",
  });
  
  let sessionCookie = null;
  for (let [k,v] of r2.headers) if (k === 'set-cookie') {
    let m = v.match(/next-auth\.session-token=([^;]+)/);
    if (m) sessionCookie = `next-auth.session-token=${m[1]}`;
  }
  
  // Now test with the wrapper endpoint
  // We'll access a test endpoint that uses our new wrapper
  console.log(`\n--- Test with raw session cookie: ${sessionCookie?.substring(0, 80)}... ---`);
  
  // First check if the session works
  let r3 = await fetch(`${BASE}/api/auth/session`, { headers: { "Cookie": sessionCookie } });
  let j3 = await r3.json();
  console.log(`Session endpoint:`, j3);
  
  // Now try grades - this should still fail with the old code
  let r4 = await fetch(`${BASE}/api/grades`, { headers: { "Cookie": sessionCookie } });
  let j4 = await r4.json();
  console.log(`Grades endpoint:`, j4);
  
  // Let me build and test a new route handler
  console.log(`\nCreating test wrapper API route...`);
  
  await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
  await prisma.school.delete({ where: { id: school.id } }).catch(() => {});
  await prisma.$disconnect();
}

main().catch(console.error);
