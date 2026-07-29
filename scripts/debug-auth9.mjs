const BASE = "http://localhost:3000";
const uid = Date.now();

async function main() {
  // 1. Get fresh CSRF
  let r1 = await fetch(`${BASE}/api/auth/csrf`);
  let c1 = [];
  for (let [k,v] of r1.headers) if (k === 'set-cookie') {
    v.split(',').forEach(x => c1.push(x.split(';')[0].trim()));
  }
  let j1 = await r1.json();
  console.log("CSRF token:", j1.csrfToken.substring(0, 30));

  // 2. Register unique user
  let email = `test-${uid}@test.com`;
  let reg = await fetch(`${BASE}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "MyPass123!" })
  });
  let regBody = await reg.json();
  console.log("Register:", reg.status, regBody.message || regBody.error, `(${email})`);

  // 3. Login
  let r2 = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "Cookie": c1.join('; ') },
    body: new URLSearchParams({ email, password: "MyPass123!", csrfToken: j1.csrfToken, callbackUrl: "/dashboard" }),
    redirect: "manual",
  });
  console.log("Login:", r2.status, r2.headers.get("location"));
  
  let sessionCookie = null;
  r2.headers.forEach((v,k) => {
    if (k.toLowerCase() === 'set-cookie' && v.includes('session-token')) {
      let m = v.match(/next-auth\.session-token=([^;]+)/);
      if (m) sessionCookie = `next-auth.session-token=${m[1]}`;
    }
  });
  
  if (!sessionCookie) { console.log("No session cookie!"); return; }
  console.log("Session:", sessionCookie.substring(0, 100));

  // 4. Test the wrapper endpoint
  console.log("\n--- GET /api/auth/test-session ---");
  let r3 = await fetch(`${BASE}/api/auth/test-session`, { headers: { "Cookie": sessionCookie } });
  let text = await r3.text();
  console.log("Status:", r3.status);
  console.log("Response:", text.substring(0, 500));
}

main().catch(console.error);
