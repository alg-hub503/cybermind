const BASE = "http://localhost:3000";

async function main() {
  // 1. CSRF
  let r1 = await fetch(`${BASE}/api/auth/csrf`);
  let c1 = [];
  for (let [k,v] of r1.headers) if (k === 'set-cookie') {
    v.split(',').forEach(x => c1.push(x.split(';')[0].trim()));
  }
  let j1 = await r1.json();
  console.log("CSRF OK:", j1.csrfToken.substring(0,20));
  console.log("CSRF cookies:", c1.join(" | "));

  // 2. Register
  let reg = await fetch(`${BASE}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "test-wrap2@test.com", password: "Test123!" })
  });
  let regBody = await reg.json();
  console.log("\nRegister:", reg.status, regBody.message || regBody.error);

  // 3. Login
  let body = new URLSearchParams({
    email: "test-wrap2@test.com",
    password: "Test123!",
    csrfToken: j1.csrfToken,
    callbackUrl: "/dashboard"
  });
  console.log("\nLogin POST body:", body.toString());
  
  let r2 = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "Cookie": c1.join('; ') },
    body: body,
    redirect: "manual",
  });
  
  console.log("Login status:", r2.status);
  console.log("Login location:", r2.headers.get("location"));
  r2.headers.forEach((v,k) => { if (k.toLowerCase() === 'set-cookie') console.log(`  Set-Cookie: ${v.substring(0,150)}`); });
  
  let text;
  try { text = await r2.text(); } catch { text = ""; }
  console.log("Login body:", text.substring(0, 200));
  
  let sessionCookie = null;
  r2.headers.forEach((v,k) => {
    if (k.toLowerCase() === 'set-cookie' && v.includes('session-token')) {
      let m = v.match(/next-auth\.session-token=([^;]+)/);
      if (m) sessionCookie = `next-auth.session-token=${m[1]}`;
    }
  });
  
  if (sessionCookie) {
    console.log(`\nSession cookie found: ${sessionCookie.substring(0,80)}...`);
    
    // Test the wrapper endpoint
    console.log("\n--- GET /api/auth/test-session ---");
    let r3 = await fetch(`${BASE}/api/auth/test-session`, { headers: { "Cookie": sessionCookie } });
    console.log("Status:", r3.status);
    let body3;
    try { body3 = await r3.json(); } catch { body3 = await r3.text(); }
    console.log("Response:", JSON.stringify(body3, null, 2).substring(0,500));
  } else {
    console.log("\nNo session cookie!");
  }
}

main().catch(console.error);
