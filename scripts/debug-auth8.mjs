const BASE = "http://localhost:3000";

async function getCsrfAndCookies() {
  let r = await fetch(`${BASE}/api/auth/csrf`);
  let cookies = [];
  for (let [k,v] of r.headers) if (k === 'set-cookie') {
    v.split(',').forEach(x => cookies.push(x.split(';')[0].trim()));
  }
  let j = await r.json();
  return { csrfToken: j.csrfToken, cookies };
}

async function login(email, password, csrfToken, cookieStr) {
  let r = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "Cookie": cookieStr },
    body: new URLSearchParams({ email, password, csrfToken, callbackUrl: "/dashboard" }),
    redirect: "manual",
  });
  let sessionCookie = null;
  r.headers.forEach((v,k) => {
    if (k.toLowerCase() === 'set-cookie' && v.includes('session-token')) {
      let m = v.match(/next-auth\.session-token=([^;]+)/);
      if (m) sessionCookie = `next-auth.session-token=${m[1]}`;
    }
  });
  return sessionCookie;
}

async function main() {
  // 1. Register user
  let { csrfToken: csrf1, cookies: c1 } = await getCsrfAndCookies();
  let reg = await fetch(`${BASE}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "test-final@test.com", password: "Pass123!" })
  });
  console.log("Register:", reg.status, (await reg.json()).message);

  // 2. Login with fresh CSRF
  let sessionCookie = await login("test-final@test.com", "Pass123!", csrf1, c1.join('; '));
  if (!sessionCookie) { console.log("Login failed!"); return; }
  console.log("Session cookie:", sessionCookie.substring(0, 80));

  // 3. Test the wrapper endpoint
  console.log("\n--- GET /api/auth/test-session ---");
  let r2 = await fetch(`${BASE}/api/auth/test-session`, { headers: { "Cookie": sessionCookie } });
  let text = await r2.text();
  console.log("Status:", r2.status);
  console.log("Response:", text.substring(0, 500));
}

main().catch(console.error);
