# CyberMind Security Architecture

Last verified: P0 verification pass (see `scripts/verify-p0-security.mjs`).

## 1. Authorization architecture

All privileged operations go through a single authorization layer in **`lib/authorization.ts`**.
There is no custom authorization logic in API routes, pages, or server actions — they all call
these helpers:

| Helper | Checks | Throws |
|---|---|---|
| `requireAuth()` | Valid session **and** user exists in DB | `UNAUTHORIZED` |
| `requireAdmin()` | `requireAuth()` + role is `ADMIN_ROLE` | `UNAUTHORIZED` / `FORBIDDEN` |
| `requireSchoolAccess(schoolId)` | `requireAuth()` + caller is ADMIN **or** caller's `schoolId` matches | `UNAUTHORIZED` / `FORBIDDEN` |
| `requireResourceAccess(resource)` | `requireAuth()` + resource exists + caller is ADMIN **or** `resource.schoolId === caller.schoolId` | `UNAUTHORIZED` / `FORBIDDEN` / `NOT_FOUND` |
| `toApiError(error)` | Maps thrown codes to HTTP responses | — |

Convention:

- **Pages** use `requireCurrentUser()` (`lib/require-current-user.ts`) which redirects to `/login`.
  Role-specific pages call `requireAdmin()` and render an error/redirect on failure.
- **API routes** wrap the helpers with `.catch(toApiError)` and return JSON:
  `UNAUTHORIZED` → 401, `FORBIDDEN` → 403, `NOT_FOUND` → 404.
- **Server actions** call the helpers directly and let errors throw (the client maps them).

## 2. Role hierarchy

Current roles (single source: `ADMIN_ROLE = "ADMIN"` in `lib/constants.ts`; `"USER"` is the
default when no ADMIN role is set):

- **ADMIN** — platform administration: all schools, all resources, `/dashboard/admin`,
  `/api/admin`, `/api/admin-stats`, creates/deletes schools, can create ADMIN users.
- **USER** — scoped to their own `schoolId`: full CRUD on their school's resources, cannot
  access platform administration, cannot create ADMIN users, cannot touch other schools.

Planned evolution (not yet implemented): `SUPER_ADMIN` for platform owners; school-domain
roles (`TEACHER`, `PARENT`, …) only when the corresponding modules ship. The role is stored as
a free-form string today; converting it to a Prisma enum is tracked in the roadmap.

## 3. Tenant isolation rules

Every school-scoped resource (`Student`, `Class`, `Grade`, `AcademicYear`, `Client`, `Invoice`,
`School`) is owned by exactly one `School`.

- **Reads:** a USER may only list/read resources where `schoolId === session.user.schoolId`.
- **Writes (POST/PUT/PATCH/DELETE):** the payload's `schoolId` must match the caller's
  `schoolId`, and updates may not move a resource to another school.
- **ADMIN bypasses** the tenant check (platform-level access).
- **IDOR protection:** `[id]` routes resolve the resource first, then `requireResourceAccess`
  rejects with 403/404 — guessing another school's ID never leaks data.
- **Server actions** must call `requireSchoolAccess(schoolId)` before touching anything.
- The page guard pattern (`/dashboard/schools/[id]/...`) is `requireCurrentUser()` + a check
  that `user.schoolId === id` (or ADMIN), otherwise `notFound()`.

## 4. How to protect new routes and server actions

### New API route

```ts
import { requireAuth, toApiError } from "@/lib/authorization";

export async function GET() {
  const access = await requireAuth().catch(toApiError);
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }
  // ...
}
```

For a resource route, resolve the resource first, then:

```ts
const item = await getItem(id);
const access = await requireResourceAccess(item).catch(toApiError);
if ("error" in access) {
  return NextResponse.json({ error: access.error }, { status: access.status });
}
```

Never write inline session/role checks in a route — use the helpers.

### New server action

```ts
"use server";

export async function myAction(data) {
  const { user } = await requireSchoolAccess(data.schoolId); // or requireAdmin()
  // ... authorized work here
}
```

Server actions are directly invocable by clients, so they MUST call `requireAuth()` /
`requireAdmin()` / `requireSchoolAccess()` before any read or write — a page-level guard is
never enough.

### New page

- Any page under `/dashboard` must call `requireCurrentUser()` first.
- Admin-only pages call `requireAdmin()`.
- School-scoped pages compare `user.schoolId` against the route param and call `notFound()`.

## 5. Known gaps (tracked, not P0)

| Gap | Status |
|---|---|
| No audit logging (no `AuditLog` model) | P4 — required before role changes go live |
| No subscription gating on API writes (`requirePremium` exists but unused) | P4 |
| `/api/register`: no rate limit, no email enumeration protection, non-transactional school+user creation | P4 |
| `requireCurrentUser()` returns the user row including the password hash (server-side only) | P4 — narrow the select |
| No security headers in `next.config.ts`; no `.env.example` | P5 |
| `/dashboard/admin` renders a generic error page for non-admins instead of a friendly 403 | P3 (UX) |
| `Client`/`Invoice` FKs on `School` have no `onDelete: Cascade` — deleting a school with data fails | Schema change required, verify intent before applying |

## 6. Verification

`scripts/verify-p0-security.mjs` runs the full RBAC + tenant-isolation suite against a local
dev server (needs `npm run dev` running on port 3000). It creates throwaway accounts/schools
and deletes them afterwards. Run it after any authorization-related change:

```
node scripts/verify-p0-security.mjs
```
