import { readFileSync } from "fs";
import { join } from "path";

const BASE_URL = "https://cybermind-rosy.vercel.app";

async function testLogin(email: string, password: string) {
  console.log(`Testing login for ${email}...`);
  
  // Step 1: Get CSRF token
  const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
  const csrfData = await csrfRes.json();
  console.log("CSRF token:", csrfData.csrfToken ? "received" : "missing");
  
  // Step 2: Try credentials login
  const loginRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      csrfToken: csrfData.csrfToken,
      email,
      password,
      redirect: "false",
      json: "true",
    }),
    redirect: "manual",
  });
  
  console.log("Login status:", loginRes.status);
  console.log("Login headers:", Object.fromEntries(loginRes.headers.entries()));
  
  const loginBody = await loginRes.text();
  console.log("Login body:", loginBody.substring(0, 200));
  
  // Step 3: Check session
  const sessionRes = await fetch(`${BASE_URL}/api/auth/session`, {
    headers: {
      Cookie: loginRes.headers.getSetCookie?.().map(c => c.split(";")[0]).join("; ") || "",
    },
  });
  const sessionData = await sessionRes.json();
  console.log("Session:", JSON.stringify(sessionData, null, 2));
}

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log("Usage: npx tsx scripts/test-login.ts <email> <password>");
  process.exit(1);
}

testLogin(email, password).catch(console.error);
