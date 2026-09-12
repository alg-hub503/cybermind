# Current Sprint — P3: Core School Features

## Sprint Goal

Implement Teachers, Staff, Roles, and Permissions infrastructure.

---

## Completed — P1 (Frozen)

- Localization
- UX polish
- Error handling
- Admin/Billing/Dashboard UX
- Authorization UI work
- Personal account pages

## Completed — P2 (14/14)

- Customer Hub
- Report Issue
- Forgot / Reset Password
- Report Migration
- School Settings Backend
- School Settings Frontend
- Platform Settings
- Contact Us
- Talk to Sales
- Change Email
- Subscription Renewal
- Trial Management
- Billing Settings
- Maintenance Mode Enforcement

---

## In Progress — P3 Phase 1

- Teachers (profiles + CRUD)
- Staff (profiles + CRUD)
- Roles (infrastructure + CRUD)
- Permissions (catalog)
- RolePermission (many-to-many)
- UserRole (assignment)
- Default roles/permissions seed
- UI pages + sidebar
- i18n

---

## Completed — P3 Phase 2 (partial)

- Permission enforcement on existing routes — `requirePermission` now guards `PUT`/`DELETE` on Teachers, Staff, Students (already had it), plus Classes, Academic Years, Grades, and Clients (`MANAGE_CLASSES`, `MANAGE_ACADEMIC_YEARS`, `MANAGE_GRADES`, `MANAGE_BILLING`). `GET` routes unchanged (tenant-scoped via `requireResourceAccess` only, no permission gate).

## Next — P3 Phase 2

- Subject Assignment
- Teacher-Class linking
- Student-Teacher relationships

### Backlog

- Profile photos/avatar system
- Teacher/Staff self-service profile editing

---

## Pending Verification

- School Admin production verification (after password reset)
- Schools page direct navigation improvement

---

## Notes

- P2 complete: 14/14 (commit `5318321`).
- Maintenance Mode Enforcement is live on `origin/main`.
- `User.role` string stays as-is — not migrated. New Role/UserRole is additive.
- `ADMIN` remains `User.role === "ADMIN"`. `requireAdmin()` unchanged.
- `TEACHER` and `STAFF` are `User.role` values.
- `prisma/migrations/migration_lock.toml` has an unrelated trailing-newline change — do NOT commit.
