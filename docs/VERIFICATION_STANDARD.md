# CyberMind — Verification Standard

## Overview

This document defines the standard verification process for all features in CyberMind.

Every feature must pass all checks before being considered complete.

---

## Required Checks

| Check | Description |
|-------|-------------|
| TypeScript | `tsc --noEmit` = 0 errors |
| Build | `npm run build` = success |
| Production Verification | All steps in feature checklist pass |
| Runtime Logs | No unhandled exceptions. No unexpected Prisma errors |
| Authorization Tested | Role-based access control verified |
| Validation Tested | Input validation works correctly |
| Negative Tests Passed | Error handling verified |
| Database Verified | Data integrity confirmed |
| Evidence Attached | Screenshots or logs for verification |

---

## Checklist Template

Each feature checklist must include:

1. **Happy Path** — Normal user flow
2. **Validation** — Empty/invalid inputs
3. **Authorization** — Role-based access
4. **Database** — Data integrity
5. **Runtime Logs** — No errors
6. **Negative Tests** — Duplicate data, edge cases

---

## Authorization Policy

When testing authorization, the expected result must match the application's authorization policy:

- `requireAdmin()` → Redirect or 403
- `requireSchoolAccess()` → 404 or Redirect
- `notFound()` → 404

The important requirement is that unauthorized users cannot access protected resources.

---

## Server Actions

When testing Server Actions:

- A Server Action request completes successfully (typically HTTP 200)
- No browser console errors
- No runtime exceptions in Vercel logs

---

## File Structure

```
docs/
 ├── verification/
 │    ├── create-user.md
 │    ├── create-school.md
 │    ├── customers.md
 │    ├── invoices.md
 │    ├── platform-settings.md
 │    ├── school-settings.md
 │    └── authentication.md
 └── VERIFICATION_STANDARD.md
```

---

## Usage

Before marking any feature as complete:

1. Run the feature-specific checklist
2. Record results in the summary table
3. Attach evidence (screenshots, logs)
4. Get approval before commit/push
