# CyberMind Rules

## Purpose

This file defines the permanent development rules of CyberMind.

These rules override temporary preferences.

---

# Rule 0 — Product North Star (Non-Negotiable)

## Vision

CyberMind is the unified operating platform for educational institutions.
Its purpose is not to replace people or make decisions for them.
Its purpose is to eliminate fragmentation by bringing every department,
workflow and piece of information into one connected platform.

## Product Philosophy

One platform. One workflow. One source of truth.

## Non-Negotiable Rule

Every future feature, module or integration must answer one question
before being accepted:

> Does this reduce fragmentation and strengthen the single source of truth?

If yes → it belongs in CyberMind.
If it introduces another disconnected source of data, duplicated entities,
or a parallel workflow → it must be rejected or redesigned.

This principle has priority over convenience, speed of development, or
marketing value.

## Long-Term Vision

CyberMind is not a collection of modules. It is one operating platform.
Students, schools, employees, finance, accounting, HR, inventory, CRM,
billing, communication, reports, AI, and future modules are all parts of
the same platform — not separate products connected later. Every module
must extend the same foundation instead of creating another system.

---

# Rule 1

Protect the project architecture.

Never change architecture without a strong technical reason.

---

# Rule 2

Always choose:

- the simplest
- the safest
- the most maintainable
- the most scalable

solution.

---

# Rule 3

Do not generate multiple solutions unless requested.

Always recommend the single best solution.

---

# Rule 4

Never rewrite working code to fix a small bug.

Find the root cause.

Apply the smallest safe fix.

---

# Rule 5

Whenever possible:

Generate complete files.

Avoid scattered edits.

---

# Rule 6

Always preserve previous architectural decisions.

Do not change previous decisions without approval.

---

# Rule 7

The project owner is a beginner.

Always provide:

- simple instructions
- practical examples
- minimal complexity

Never assume advanced knowledge.

---

# Rule 8

Keep CyberMind production-ready after every completed task.

The project should compile and run successfully at every stage.

---

# Rule 9

When an external source can improve accuracy, verify using official documentation before making important technical decisions.

Preferred documentation:

- Next.js
- React
- Prisma
- PostgreSQL
- Tailwind CSS
- Vercel
- Stripe
- TypeScript

Never guess when documentation exists.

---

# Rule 10

Stop implementation and recommend a review when:

- architecture becomes inconsistent
- technical debt grows
- security is affected
- performance is affected
- before production deployment

---

# Rule 11

Think long-term.

Do not sacrifice maintainability for temporary convenience.

---

# Rule 12

CyberMind is a professional SaaS project.

Every decision should move the project closer to production quality.

---

# Rule 13

Whenever a new file is required:

Always provide:

1. File name.
2. File location.
3. PowerShell command to create the file.
4. PowerShell command to open the file in VS Code.
5. Complete file content.

Never ask the developer to manually create files.

---

# Rule 14

Whenever an existing file must be modified:

Always provide the complete replacement file.

Never provide partial edits unless the modification is fewer than 5 lines.

---

# Rule 15

Always optimize the developer workflow.

Prefer PowerShell commands over manual operations whenever possible.

Always recommend the fastest, simplest and safest workflow.

Never ask the developer to navigate through menus if a PowerShell command can accomplish the same task.

---

# Rule 16

When a project review is required:

Stop implementation.

Explain why the review is necessary.

Review the entire module before continuing development.

Never continue building on unstable foundations.