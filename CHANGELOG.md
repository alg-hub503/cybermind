# Changelog

## v1.1.0 — 2026-07-25

### Frontend Billing Integration (Phase 5)

- **New `/dashboard/billing`**: subscription overview (plan, status, renewal, cancel status), invoice table with PDF links, Customer Portal button, Cancel Subscription button, billing summary export
- **New `/dashboard/subscription`**: plan details, status, period start/end, renewal/expiry date, Stripe reference for admins
- **Fixed `/upgrade`**: now reads `School->Subscription` status before showing upgrade CTA; redirects to `/dashboard` if already active; shows current status for non-active subscriptions (e.g. incomplete, past_due)
- **New API routes**: `POST /api/stripe/portal` (creates Customer Portal session), `POST /api/stripe/cancel-subscription` (cancels Stripe subscription)
- Checkout `success_url` already pointed to `/dashboard` (no change needed)
- Admin dashboard already reads `School.subscription.status` (no change needed)

## v1.0.0 — 2026-07-25

### Billing Consolidation (Phases 1–4)

Architectural decision: Subscription owned by **School**, not User. No email-based dependency anywhere in the billing system.

**Webhook layer:**
- Thin route → dispatcher → 4 handlers
- Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- All 4 events are enabled on the Stripe webhook endpoint

**Application layer (17 services):**
- Customer Portal session creation
- Invoice CRUD (create, read, update, delete, list, pay, download)
- Payment listing and refund (full + partial)
- Coupon apply/remove
- Tax calculation (stub, ready for Stripe Tax integration)
- Receipt URL generation
- Billing export (invoices + payments + refunds aggregated)
- Billing status query
- Subscription cancellation

**Cross-cutting:**
- DTOs (`InvoiceDto`, `PaymentDto`, `RefundDto`, `PaginatedResult`)
- `BillingError` + `translateStripeError` (7 Stripe error types mapped)
- Idempotency keys on all money-moving operations
- Pagination support (`startingAfter`/`endingBefore`/`hasMore`)
- Shared `normalizeSubscriptionStatus` utility

**Known limitations (backlog, not blocking):**
- Idempotency key collision on `create-invoice` when identical amount + currency within 24h window
- `hasMore` in `list-refunds` reflects the raw (unfiltered) Stripe response; accuracy degrades with >100 PaymentIntents

**Cleanup:**
- Removed dead duplicate `app/lib/prisma.ts`

## Unreleased

### School Settings

Completed:

- SchoolSettings Prisma model (26 columns, 1:1 with School via `schoolId @unique`, `onDelete: Cascade`)
- Migration (`20260802000000_add_school_settings`)
- Zod validation (locale: ar/en, currency: 12 values, timezone: 35 IANA values, dateFormat: 3 formats)
- Repository (`prisma-school-settings-repository.ts`) with `findBySchoolId`, `findOrCreateBySchoolId`, `update`
- Service layer (`school-settings-service.ts`)
- Server actions (`school-settings-actions.ts`)
- Protected API (`GET/PUT /api/schools/[id]/settings`) with `requireSchoolAccess`
- Lazy-create behavior via upsert (returns defaults if no row exists)
- School Settings UI at `/dashboard/schools/[id]/settings`
- Six independent tabs: General, Branding, Regional, Contact, Billing, Legal
- Each tab saves independently
- 50+ translation keys (en/ar)
- Admin production verification
- Unified authorization (`requireSchoolAccess` allows ADMIN any school, USER own school only)
- Sidebar conditional: ADMIN → schools list, USER → direct settings link
- Path migration: moved from `/dashboard/school-settings` to `/dashboard/schools/[id]/settings`

Fixed:

- Missing authorization check on school-scoped pages (clients, invoices, users, analytics, school detail) — previously any authenticated user could access another school's data by changing the URL.

## Planned / Tech Debt

- **Subscription lifecycle refactor** — every School should get exactly one Subscription row automatically at creation time (plan: FREE, status: TRIAL or equivalent), removing the need for any `?? "TRIAL"` / `?? "TRIALING"` fallback anywhere in the code. This requires: (1) updating School-creation code paths (register/route.ts, school-user-actions.ts) to create a default Subscription row transactionally, (2) a one-time backfill migration for the 7+ existing schools that currently have zero Subscription rows, (3) removing all fallback logic once every School is guaranteed to have a row, (4) an audit confirming no code path can create a School without one. This is a real data migration touching production rows and should be planned and executed as its own dedicated task with the same checkpoint-commit discipline used throughout this project — not bundled with unrelated work.
