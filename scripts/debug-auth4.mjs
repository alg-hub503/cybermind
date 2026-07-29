// Direct comprehensive auth test
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const BASE = "http://localhost:3000";

async function main() {
  // Clean up any previous test user
  await prisma.student.deleteMany({ where: { schoolId: { not: undefined } } }).catch(() => {});
  // Create a fresh user directly
  const bcrypt = await import("bcryptjs");
  const hash = await bcrypt.default.hash("directTest123!", 12);
  
  const school = await prisma.school.create({ data: { name: "Direct Test School" } });
  const user = await prisma.user.create({
    data: { email: "direct-test@cybermind.test", password: hash, schoolId: school.id, role: "USER" }
  });
  console.log(`Created user: ${user.email}, schoolId: ${school.id}`);
  
  // Now try logging in via HTTP
  console.log("\n--- Step 1: GET CSRF ---");
  let r1 = await fetch(`${BASE}/api/auth/csrf`);
  console.log(`Status: ${r1.status}`);
  let csrfCookies = [];
  for (let [k,v] of r1.headers) if (k === 'set-cookie') csrfCookies.push(v.split(',').flat());
  csrfCookies = csrfCookies.flat().map(c => c.split(';')[0].trim());
  console.log(`Cookies: ${csrfCookies.join('; ')}`);
  let b1 = await r1.json();
  console.log(`CSRF Token: ${b1.csrfToken}`);

  console.log("\n--- Step 2: Login ---");
  let r2 = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "Cookie": csrfCookies.join('; ') },
    body: new URLSearchParams({ email: "direct-test@cybermind.test", password: "directTest123!", csrfToken: b1.csrfToken, callbackUrl: "/dashboard" }),
    redirect: "manual",
  });
  console.log(`Status: ${r2.status}`);
  console.log(`Location: ${r2.headers.get("location")}`);
  let loginCookies = [];
  for (let [k,v] of r2.headers) if (k === 'set-cookie') loginCookies.push(v.split(',').flat());
  loginCookies = loginCookies.flat().map(c => c.split(';')[0].trim());
  console.log(`Set-Cookie: ${loginCookies.join('; ')}`);
  let b2;
  try { b2 = await r2.text(); } catch {}
  console.log(`Body: ${b2}`);

  // Check session
  console.log("\n--- Step 3: GET /api/auth/session with login cookies ---");
  let r3 = await fetch(`${BASE}/api/auth/session`, { headers: { "Cookie": loginCookies.join('; ') } });
  console.log(`Status: ${r3.status}`);
  let b3 = await r3.json();
  console.log(`Session:`, b3);

  // Try grades
  console.log("\n--- Step 4: GET /api/grades with login cookies ---");
  let r4 = await fetch(`${BASE}/api/grades`, { headers: { "Cookie": loginCookies.join('; ') } });
  console.log(`Status: ${r4.status}`);
  let b4;
  try { b4 = await r4.json(); } catch { b4 = await r4.text(); }
  console.log(`Response:`, b4);

  // Cleanup
  await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
  await prisma.school.delete({ where: { id: school.id } }).catch(() => {});
  await prisma.$disconnect();
}

main().catch(console.error);
