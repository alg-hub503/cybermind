# ADR-001 — Stripe Billing Architecture

**Status:** Approved

**Date:** 2026-07-14

---

# Context

CyberMind is a production SaaS application.

Billing must be reliable, maintainable, and follow Stripe best practices.

The application will use Stripe as the billing platform.

---

# Problem

The initial implementation upgraded users to PRO after a single successful Checkout.

This approach cannot correctly handle:

- subscription renewals
- failed payments
- cancellations
- upgrades
- downgrades
- billing portal actions

A production-ready architecture is required.

---

# Decision

Stripe will become the single source of truth for billing.

The local PostgreSQL database will mirror Stripe state.

The application will never assume subscription status from local flags alone.

---

# Billing Models

The local database stores only billing information required by the application.

Included:

- User
- Subscription
- WebhookEvent

Not mirrored during v1:

- Product
- Price
- Invoice

These remain managed by Stripe.

---

# Checkout Flow

Checkout must:

1. Find the authenticated user.
2. Reuse stripeCustomerId if available.
3. Create a Stripe Customer only once.
4. Save stripeCustomerId.
5. Create Checkout Session using a Stripe Price ID.

Inline price_data is not allowed.

---

# Subscription Lifecycle

Mandatory webhook events:

- checkout.session.completed
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- invoice.payment_succeeded
- invoice.payment_failed

---

# Customer Portal

Customer Portal is part of v1.

Users must be able to:

- update payment method
- cancel subscription
- download invoices

without administrator intervention.

---

# Access Control

Application permissions are based on Subscription.status.

Never grant access only because a local string equals "PRO".

---

# Webhook Reliability

Webhook processing must include:

- signature verification
- idempotency
- processed event logging
- error logging

---

# Implementation Order

1. Stripe Product & Price
2. Prisma Billing Models
3. Checkout Refactor
4. Subscription Lifecycle
5. Customer Portal
6. Access Control
7. Production Testing

---

# Reasoning

This architecture minimizes duplicated billing data while keeping the application scalable and production-ready.

Stripe remains responsible for billing.

CyberMind remains responsible for authorization and business logic.
