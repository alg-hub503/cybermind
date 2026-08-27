const BASE_URL = "https://cybermind-rosy.vercel.app";

export interface LoginResult {
  cookieHeader: string;
}

async function login(email: string, password: string): Promise<LoginResult> {
  // Step 1: Get CSRF token + cookie
  const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
  const csrfData = await csrfRes.json();
  const csrfToken = csrfData.csrfToken;
  const csrfCookies = csrfRes.headers.getSetCookie?.() || [];
  
  if (!csrfToken) throw new Error("No CSRF token");
  
  const csrfCookie = csrfCookies
    .find(c => c.includes("__Host-next-auth.csrf-token"))
    ?.split(";")[0];
  
  if (!csrfCookie) throw new Error("No CSRF cookie");
  
  // Step 2: Send login with CSRF cookie included
  const loginRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": csrfCookie,
    },
    body: new URLSearchParams({ csrfToken, email, password, json: "true" }),
    redirect: "manual",
  });
  
  const setCookies = loginRes.headers.getSetCookie?.() || [];
  const sessionCookie = setCookies.find(c => c.includes("next-auth.session-token"));
  
  if (sessionCookie) {
    // Return the session cookie as a proper cookie header value
    const cookieName = sessionCookie.split("=")[0].split(";")[0].trim();
    const cookieValue = sessionCookie.split("=").slice(1).join("=").split(";")[0];
    return { cookieHeader: `${cookieName}=${cookieValue}` };
  }
  
  const location = loginRes.headers.get("location");
  throw new Error(`No session cookie. Status: ${loginRes.status}, Redirect: ${location}`);
}

export { login };

if (require.main === module) {
  login(process.argv[2], process.argv[3])
    .then(r => console.log("OK:", r.cookieHeader.substring(0, 50) + "..."))
    .catch(e => console.error("FAIL:", e.message));
}
