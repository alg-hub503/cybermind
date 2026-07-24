# CyberMind Architecture

## Overview

CyberMind follows a modular, scalable and production-ready architecture.

The project must remain simple to understand while supporting future growth.

---

# Core Stack

Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4

Backend

- Next.js App Router
- Route Handlers
- Prisma ORM

Database

- PostgreSQL
- Neon

Authentication

- NextAuth

Payments

- Stripe

Deployment

- Vercel

---

# Architecture Layers

Presentation

↓

Components

↓

Business Logic

↓

API Routes

↓

Prisma ORM

↓

PostgreSQL

---

# Folder Organization

app/
components/
lib/
prisma/
public/
types/
middleware.ts

---

# Development Rules

- Keep components reusable.
- Separate UI from business logic.
- Keep database logic inside Prisma.
- Avoid duplicated code.
- Prefer composition over duplication.
- Use Server Components by default.
- Use Client Components only when necessary.

---

# Database Principles

- Normalize data.
- Use Prisma relations correctly.
- Avoid duplicated information.
- Protect referential integrity.

---

# Performance Principles

- Minimize database queries.
- Prefer server rendering.
- Lazy load when appropriate.
- Avoid unnecessary client-side JavaScript.

---

# Security Principles

- Validate every input.
- Never trust client data.
- Protect API routes.
- Protect sensitive environment variables.
- Review authentication and authorization.

---

# Scalability

Every new module should integrate into the existing architecture without requiring major refactoring.

Architecture changes require a clear technical justification.

---

# AI Development Rules

Before modifying architecture:

1. Analyze the impact.
2. Preserve compatibility.
3. Explain the reason.
4. Recommend the safest solution.
5. Wait for approval if the change is significant.