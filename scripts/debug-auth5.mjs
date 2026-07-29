const BASE = "http://localhost:3000";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("test123", 12);
  const school = await prisma.school.create({ data: { name: "Debug School" } });
  const user = await prisma.user.create({
    data: { email: "debug-final@test.com", password: hash, schoolId: school.id, role: "USER" }
  });
  console.log(`User: ${user.id}, School: ${school.id}`);

  let r1 = await fetch(`${BASE}/api/auth/csrf`);
  let cookies1 = [];
  for (let [k, v] of r1.headers) if (k === 'set-cookie') cookies1.push(v);
  let j1 = await r1.json();

  let r2 = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "Cookie": cookies1.join('; ') },
    body: new URLSearchParams({ email: "debug-final@test.com", password: "test123", csrfToken: j1.csrfToken, callbackUrl: "/dashboard" }),
    redirect: "manual",
  });

  let sessionCookie = null;
  for (let [k, v] of r2.headers) {
    if (k === 'set-cookie') {
      if (v.includes('session-token')) {
        let match = v.match(/next-auth\.session-token=([^;]+)/);
        if (match) sessionCookie = `next-auth.session-token=${match[1]}`;
      }
    }
  }

  console.log(`\n--- Test 1: GET /api/auth/session ---`);
  let r3 = await fetch(`${BASE}/api/auth/session`, { headers: { "Cookie": sessionCookie } });
  let j3 = await r3.json();
  console.log(`Status: ${r3.status}, Session:`, j3);

  console.log(`\n--- Test 2: GET /api/grades ---`);
  let r4 = await fetch(`${BASE}/api/grades`, { headers: { "Cookie": sessionCookie } });
  let j4 = await r4.json();
  console.log(`Status: ${r4.status}, Body:`, j4);

  // Also try with ALL cookies
  let allParsed = [];
  for (let [k, v] of r2.headers) if (k === 'set-cookie') {
    v.split(',').forEach(c => allParsed.push(c.split(';')[0].trim()));
  }
  console.log(`\n--- Test 3: GET /api/grades with ALL cookies: ${allParsed.join('; ')} ---`);
  let r5 = await fetch(`${BASE}/api/grades`, { headers: { "Cookie": allParsed.join('; ') } });
  let j5 = await r5.json();
  console.log(`Status: ${r5.status}, Body:`, j5);

  // Also try sending the CSRF cookies + session cookie
  let allCookies = [...cookies1.map(c => c.split(',')).flat().map(c => c.split(';')[0].trim()), sessionCookie].filter(Boolean);
  console.log(`\n--- Test 4: GET /api/grades with ALL cookies (csrf+session): ${allCookies.join('; ')} ---`);
  let r6 = await fetch(`${BASE}/api/grades`, { headers: { "Cookie": allCookies.join('; ') } });
  let j6 = await r6.json();
  console.log(`Status: ${r6.status}, Body:`, j6);

  await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
  await prisma.school.delete({ where: { id: school.id } }).catch(() => {});
  await prisma.$disconnect();
}

main().catch(console.error);
