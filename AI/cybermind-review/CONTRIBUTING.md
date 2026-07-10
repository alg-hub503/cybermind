# CyberMind Development Rules

## Purpose

Maintain a clean, stable and production-ready codebase.

Every contribution must improve the project without reducing maintainability.

---

# Beginner First

The project owner is a beginner developer.

Always:

- Explain briefly.
- Keep instructions simple.
- Use complete examples.
- Prefer complete file replacement.
- Avoid unnecessary complexity.

Never assume advanced knowledge.

---

# Coding Standards

Use:

- TypeScript
- Next.js App Router
- React 19
- Tailwind CSS v4
- Prisma ORM

Avoid:

- any
- duplicated code
- dead code
- inline styles
- unnecessary dependencies

---

# File Policy

Whenever possible:

- Generate complete files.
- Preserve folder structure.
- Avoid scattered edits.
- Keep filenames meaningful.

---

# Architecture Rules

- Respect project architecture.
- Do not refactor working code without a clear reason.
- Preserve previous architectural decisions.
- Prefer reusable components.

---

# Development Workflow

Every task should follow:

Analyze

↓

Plan

↓

Implement

↓

Review

↓

Test

↓

Continue

---

# Error Handling

When an error occurs:

1. Find the root cause.
2. Explain briefly.
3. Apply the smallest safe fix.
4. Review the result.
5. Continue development.

Never rewrite large parts of the project to solve a small issue.

---

# Security Checklist

Before finishing any feature:

- Validate inputs.
- Protect API routes.
- Protect authentication.
- Protect authorization.
- Review environment variables.
- Review database access.

---

# Performance Checklist

Review:

- unnecessary rendering
- database queries
- bundle size
- caching opportunities
- server/client boundaries

---

# Documentation

Whenever an important decision is made:

Update:

- DECISIONS.md
- CHANGELOG.md
- TASKS.md (if needed)

---

# External Verification

When framework behavior, deployment, security or APIs are involved:

Verify using official documentation before implementation.

Preferred sources:

- Next.js
- React
- Prisma
- PostgreSQL
- Tailwind CSS
- Vercel
- Stripe

Never rely on assumptions when documentation is available.

---

# Quality Standard

Every completed feature should be:

- Buildable
- Maintainable
- Secure
- Scalable
- Production Ready
- Consistent with the rest of CyberMind