// Page sweep — the closest a script can get to "click every page and see
// what breaks". Seeds a school with real data, logs in as its owner, then
// follows every internal /dashboard link it can find (breadth-first, from
// /dashboard) and reports:
//   - dead links (404), forbidden links (401/403), server errors (5xx),
//     failed/timed-out requests
//   - redirects that leave /dashboard (e.g. to /login = lost session)
//   - 200 pages whose HTML carries an error-boundary marker
// It then re-checks the same pages with lang=en and lang=fr (the app picks
// the locale from the `lang` cookie; the default is ar) and lists any
// translation KEY shown as text, which is what t() falls back to when a key
// is missing everywhere.
//
// It is a REPORT: it deliberately does not assume what each page "should"
// return for an owner (an earlier script assumed PATCH where the route has
// PUT and produced a false failure). Findings are things a human should
// look at, not automatic verdicts. It only issues GET requests to pages.
//
// Does not cover: how pages LOOK, buttons that run JavaScript (a link-only
// crawl cannot click them), or anything outside /dashboard.
//
// Run: npx tsx scripts/trial-pages-sweep.ts

import { spawn, type ChildProcess } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";
import { seedSchoolAndOwner } from "./lib/seed-test-school";
import { killProcessTree } from "./lib/kill-process-tree";

const BASE = "http://localhost:3000";
const TEST_EMAIL_DOMAIN = "test.local";
const PORT_READY_TIMEOUT_MS = 180_000;
const REQUEST_TIMEOUT_MS = 90_000;
const MAX_PAGES = 150;

type HttpResult = { status: number; body: unknown };
type PageResult = {
  path: string;
  status: number;
  location: string | null;
  marker: string | null;
  failure: string | null;
};

let server: ChildProcess | null = null;
const prisma = new PrismaClient();

const log: string[] = [];
const devLog: string[] = [];
let findings = 0;

let sweepUid: string | undefined;
let sweepOwnerEmail: string | undefined;

function heading(title: string) {
  log.push(`\n${"=".repeat(70)}\n  ${title}\n${"=".repeat(70)}`);
}
function finding(text: string) {
  findings++;
  log.push(`  FINDING ${text}`);
}

async function cleanupSweepData(): Promise<void> {
  if (!sweepUid) return;

  const owner = sweepOwnerEmail
    ? await prisma.user.findUnique({ where: { email: sweepOwnerEmail }, select: { schoolId: true } })
    : null;
  const schoolId = owner?.schoolId ?? undefined;

  if (schoolId) {
    await prisma.invoice.deleteMany({ where: { schoolId } });
    await prisma.client.deleteMany({ where: { schoolId } });
    await prisma.student.deleteMany({ where: { schoolId } });
    await prisma.class.deleteMany({ where: { schoolId } });
    await prisma.grade.deleteMany({ where: { schoolId } });
    await prisma.academicYear.deleteMany({ where: { schoolId } });
  }
  await prisma.user.deleteMany({ where: { email: { contains: sweepUid } } });
  if (schoolId) {
    await prisma.school.deleteMany({ where: { id: schoolId } });
    // Role.schoolId has no foreign key, so deleting the school leaves roles behind.
    await prisma.role.deleteMany({ where: { schoolId } });
  }
}

async function waitForServer(): Promise<boolean> {
  const deadline = Date.now() + PORT_READY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (server?.exitCode !== null && server?.exitCode !== undefined) return false;
    try { const res = await fetch(`${BASE}/api/auth/csrf`); if (res.ok) return true; } catch { /* not ready */ }
    await new Promise((r) => setTimeout(r, 2000));
  }
  return false;
}

function startDevServer(): ChildProcess {
  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
  const child = spawn(npmCmd, ["run", "dev"], { cwd: process.cwd(), stdio: ["ignore", "pipe", "pipe"], shell: process.platform === "win32" });
  child.stdout?.on("data", (d: Buffer) => devLog.push(d.toString().trimEnd()));
  child.stderr?.on("data", (d: Buffer) => devLog.push(d.toString().trimEnd()));
  return child;
}

async function login(email: string, password: string): Promise<string | null> {
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`, { redirect: "manual" });
  const rawCookies = csrfRes.headers.get("set-cookie") || "";
  const cookies: string[] = [];
  for (const c of rawCookies.split(/(?<!Expires=[^;]*),(?! )/)) cookies.push(c.split(";")[0].trim());
  const { csrfToken } = await csrfRes.json();
  if (!csrfToken) return null;
  const loginRes = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Cookie: cookies.join("; ") },
    body: new URLSearchParams({ email, password, csrfToken, callbackUrl: "/dashboard" }),
    redirect: "manual",
  });
  const setCookie = loginRes.headers.get("set-cookie");
  if (!setCookie) return null;
  for (const c of setCookie.split(/(?<!Expires=[^;]*),(?! )/)) {
    const m = c.match(/next-auth\.session-token=([^;]+)/);
    if (m) return `next-auth.session-token=${m[1]}`;
  }
  return null;
}

async function authedJson(path: string, body: unknown, cookie: string): Promise<HttpResult> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { Cookie: cookie, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    redirect: "manual",
  });
  const ct = res.headers.get("content-type") || "";
  let parsed: unknown = null;
  if (ct.includes("application/json")) { try { parsed = await res.json(); } catch { parsed = null; } }
  return { status: res.status, body: parsed };
}

async function createEntity(label: string, path: string, body: unknown, cookie: string): Promise<string | undefined> {
  const r = await authedJson(path, body, cookie);
  if (r.status !== 201) {
    log.push(`  note: could not create ${label} (POST ${path} -> ${r.status}); pages that list it will render without it`);
    return undefined;
  }
  if (r.body && typeof r.body === "object" && "id" in r.body) {
    const id = (r.body as { id?: unknown }).id;
    return typeof id === "string" ? id : undefined;
  }
  return undefined;
}

// ── link handling ─────────────────────────────────────────────────────

function normalizePath(href: string): string | null {
  if (!href.startsWith("/") || href.startsWith("//")) return null;
  let p = href.split("#")[0].split("?")[0];
  // /en/dashboard and /dashboard are the same page: the proxy strips the
  // prefix and sets the lang cookie.
  p = p.replace(/^\/(en|ar|fr)(?=\/|$)/, "");
  if (p === "") p = "/";
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  return p;
}

function shouldFollow(p: string): boolean {
  if (!(p === "/dashboard" || p.startsWith("/dashboard/"))) return false;
  if (/\.[a-z0-9]{2,5}$/i.test(p)) return false;
  return true;
}

function extractLinks(html: string): string[] {
  const out = new Set<string>();
  const re = /href="([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const p = normalizePath(m[1].replace(/&amp;/g, "&"));
    if (p && shouldFollow(p)) out.add(p);
  }
  return Array.from(out);
}

const ERROR_MARKER = /Application error: a (?:server|client)-side exception|Internal Server Error|Unhandled Runtime Error/i;

async function fetchPage(
  path: string,
  sessionCookie: string,
  lang: string
): Promise<{ status: number; location: string | null; html: string }> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { Cookie: `${sessionCookie}; lang=${lang}`, Accept: "text/html" },
      redirect: "manual",
      signal: ctrl.signal,
    });
    const ct = res.headers.get("content-type") || "";
    const html = ct.includes("text/html") ? await res.text() : "";
    return { status: res.status, location: res.headers.get("location"), html };
  } finally {
    clearTimeout(timer);
  }
}

// ── translations ──────────────────────────────────────────────────────

function loadMessages(locale: string): Record<string, string> {
  const raw = readFileSync(join(process.cwd(), "lib", "i18n", "messages", `${locale}.json`), "utf8");
  return JSON.parse(raw.replace(/^\uFEFF/, "")) as Record<string, string>;
}

async function main() {
  server = startDevServer();
  heading("Starting dev server");
  const ready = await waitForServer();
  if (!ready) {
    log.push("  FAIL dev server did not become ready");
    console.log(log.join("\n"));
    console.log("\n--- dev server output (tail) ---\n" + devLog.slice(-40).join("\n"));
    killProcessTree(server?.pid);
    process.exit(1);
  }
  log.push("  Dev server ready");

  const uid = `sweep${Date.now()}`;
  const password = "Pass123!";
  const ownerEmail = `sweep-owner-${uid}@${TEST_EMAIL_DOMAIN}`;
  sweepUid = uid;
  sweepOwnerEmail = ownerEmail;

  // ── Setup: a school with data, so pages render with something in them ──
  heading("SETUP: a school with data (seeded directly; real signup was covered by trial-new-school.ts)");
  const { schoolId } = await seedSchoolAndOwner(prisma, ownerEmail, password);
  const cookieOwner = await login(ownerEmail, password);
  if (!cookieOwner) throw new Error("owner login failed");
  log.push(`  school ${schoolId}, owner logged in`);

  const yearId = await createEntity("academic year", "/api/academic-years", {
    schoolId, name: "2026-2027", startDate: "2026-09-01", endDate: "2027-06-30", isCurrent: true,
  }, cookieOwner);
  const gradeId = await createEntity("grade", "/api/grades", { schoolId, name: "Grade 1", order: 1 }, cookieOwner);
  if (yearId && gradeId) {
    await createEntity("class", "/api/classes", { schoolId, gradeId, academicYearId: yearId, name: "Section A", code: "G1-A" }, cookieOwner);
  }
  const clientId = await createEntity("client", "/api/clients", { schoolId, name: "Sweep Parent Client" }, cookieOwner);
  await createEntity("student", "/api/students", {
    schoolId, code: `STU-${uid}`, firstName: "Sweep", lastName: "Student", dateOfBirth: "2015-01-01",
  }, cookieOwner);
  await createEntity("teacher", "/api/teachers", {
    schoolId, name: "Sweep Teacher", email: `sweep-teacher-${uid}@${TEST_EMAIL_DOMAIN}`, password, specialization: "Mathematics",
  }, cookieOwner);
  await createEntity("staff member", "/api/staff", {
    schoolId, name: "Sweep Staff", email: `sweep-staff-${uid}@${TEST_EMAIL_DOMAIN}`, password, position: "Receptionist",
  }, cookieOwner);
  if (clientId) {
    await createEntity("invoice", "/api/invoices", { schoolId, amount: 500, clientId }, cookieOwner);
  }
  // The school's own dashboard is linked from /dashboard, but make sure the
  // crawl also starts from it in case /dashboard just redirects elsewhere.
  const startPaths = ["/dashboard", `/dashboard/schools/${schoolId}`];

  // ── Crawl in Arabic (the default locale) ──────────────────────────────
  heading("1. Crawl every internal /dashboard link as the school owner (lang=ar)");
  const queue: string[] = [...startPaths];
  const results = new Map<string, PageResult>();
  const referrers = new Map<string, Set<string>>();
  const pageHtml = new Map<string, string>();
  let capped = false;

  while (queue.length > 0) {
    if (results.size >= MAX_PAGES) { capped = true; break; }
    const path = queue.shift() as string;
    if (results.has(path)) continue;

    let status = 0;
    let location: string | null = null;
    let html = "";
    let failure: string | null = null;
    try {
      const page = await fetchPage(path, cookieOwner, "ar");
      status = page.status;
      location = page.location;
      html = page.html;
    } catch (e) {
      failure = e instanceof Error ? e.message : String(e);
    }

    const marker = status === 200 && ERROR_MARKER.test(html) ? (html.match(ERROR_MARKER) as RegExpMatchArray)[0] : null;
    results.set(path, { path, status, location, marker, failure });
    if (status === 200) pageHtml.set(path, html);

    if (status >= 300 && status < 400 && location) {
      try {
        const target = normalizePath(new URL(location, BASE).pathname);
        if (target && shouldFollow(target) && !results.has(target)) queue.push(target);
      } catch { /* unparseable Location header — reported below as a redirect */ }
    }
    if (status === 200) {
      for (const link of extractLinks(html)) {
        if (!referrers.has(link)) referrers.set(link, new Set());
        (referrers.get(link) as Set<string>).add(path);
        if (!results.has(link)) queue.push(link);
      }
    }
  }

  const byStatus = new Map<string, number>();
  for (const res of results.values()) {
    const key = res.failure ? "request failed" : String(res.status);
    byStatus.set(key, (byStatus.get(key) ?? 0) + 1);
  }
  log.push(`  pages visited: ${results.size}${capped ? ` (stopped at the ${MAX_PAGES}-page cap — more exist)` : ""}`);
  log.push(`  status counts: ${Array.from(byStatus.entries()).map(([k, v]) => `${k} x${v}`).join(", ")}`);
  log.push("\n  all visited paths:");
  for (const res of results.values()) {
    const where = res.location ? ` -> ${res.location}` : "";
    log.push(`    ${res.failure ? "ERR" : res.status}  ${res.path}${where}`);
  }

  heading("2. Findings in the crawl");
  const before = findings;
  for (const res of results.values()) {
    const from = Array.from(referrers.get(res.path) ?? []).join(", ") || "(start page)";
    if (res.failure) {
      finding(`request failed or timed out: ${res.path} — ${res.failure}`);
    } else if (res.status >= 500) {
      finding(`server error ${res.status}: ${res.path} — linked from: ${from}`);
    } else if (res.status === 404) {
      finding(`DEAD LINK 404: ${res.path} — linked from: ${from}`);
    } else if (res.status === 401 || res.status === 403) {
      finding(`link visible to the owner but denied (${res.status}): ${res.path} — linked from: ${from}`);
    } else if (res.status >= 300 && res.status < 400) {
      const target = res.location ? normalizePath(new URL(res.location, BASE).pathname) : null;
      if (!target || !shouldFollow(target)) {
        finding(`redirect leaves /dashboard (${res.status} -> ${res.location}): ${res.path} — linked from: ${from}`);
      }
    } else if (res.marker) {
      finding(`200 but the page carries an error marker "${res.marker}": ${res.path} — linked from: ${from}`);
    }
  }
  if (findings === before) log.push("  none");

  // ── Same pages in English and French ──────────────────────────────────
  heading("3. Re-check the pages that returned 200 in lang=en and lang=fr");
  const okPaths = Array.from(results.values()).filter((r) => r.status === 200).map((r) => r.path);
  const namespaces = new Set(Object.keys(loadMessages("ar")).map((k) => k.split(".")[0]));
  const keyLike = />\s*([A-Za-z][A-Za-z0-9]*(?:\.[A-Za-z][A-Za-z0-9]*)+)\s*</g;
  const leaked = new Map<string, Set<string>>(); // "lang key" -> paths

  for (const lang of ["en", "fr", "ar"] as const) {
    let checked = 0;
    for (const path of okPaths) {
      let page: { status: number; location: string | null; html: string };
      try {
        page = await fetchPage(path, cookieOwner, lang);
      } catch (e) {
        finding(`[${lang}] request failed or timed out: ${path} — ${e instanceof Error ? e.message : String(e)}`);
        continue;
      }
      checked++;
      if (page.status !== 200) {
        finding(`[${lang}] ${path} returned ${page.status} (it returned 200 in the first pass)`);
        continue;
      }
      if (ERROR_MARKER.test(page.html)) {
        finding(`[${lang}] ${path} carries an error marker`);
      }
      keyLike.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = keyLike.exec(page.html)) !== null) {
        const key = m[1];
        if (namespaces.has(key.split(".")[0])) {
          const id = `${lang} ${key}`;
          if (!leaked.has(id)) leaked.set(id, new Set());
          (leaked.get(id) as Set<string>).add(path);
        }
      }
    }
    log.push(`  [${lang}] pages re-checked: ${checked}`);
  }

  heading("4. Translation keys shown as text (t() falls back to the key itself when it is missing everywhere)");
  if (leaked.size === 0) {
    log.push("  none seen on any visited page");
  } else {
    for (const [id, paths] of leaked.entries()) {
      finding(`untranslated key on screen [${id}] — on: ${Array.from(paths).slice(0, 3).join(", ")}`);
    }
  }

  heading("5. Translation file parity (offline, information only)");
  const ar = Object.keys(loadMessages("ar"));
  const en = Object.keys(loadMessages("en"));
  const fr = Object.keys(loadMessages("fr"));
  const all = new Set([...ar, ...en, ...fr]);
  for (const [name, keys] of [["ar", ar], ["en", en], ["fr", fr]] as const) {
    const have = new Set(keys);
    const missing = Array.from(all).filter((k) => !have.has(k));
    log.push(`  ${name}: ${keys.length} keys, ${missing.length} missing vs the union${missing.length ? ` — e.g. ${missing.slice(0, 8).join(", ")}` : ""}`);
  }

  heading("Cleanup");
  await cleanupSweepData();
  log.push("  Test data removed");

  heading(`RESULTS: ${results.size} pages crawled, ${findings} finding(s) to review`);
  console.log(log.join("\n"));
  killProcessTree(server?.pid);
  await prisma.$disconnect();
  process.exit(findings > 0 ? 1 : 0);
}

main().catch(async (e) => {
  console.log(log.join("\n"));
  console.error("Fatal:", e);
  console.log("\n--- dev server output (tail) ---\n" + devLog.slice(-40).join("\n"));
  killProcessTree(server?.pid);
  try {
    await cleanupSweepData();
    console.log("(cleanup of this run's test data attempted after the failure)");
  } catch (cleanupErr) {
    console.error("Cleanup after failure ALSO failed — look for leftover @test.local rows:", cleanupErr);
  }
  await prisma.$disconnect();
  process.exit(1);
});
