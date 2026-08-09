# Current Sprint — P2: Platform & Settings

## Sprint Goal

Complete all Platform & Settings features.

---

## Completed

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

---

## In Progress

None

---

## Next

- Subscription Renewal
- Trial Management

### Backlog

- Maintenance Mode Enforcement
  - Requires architecture/design decision before implementation:
    - Maintenance scope and blocked routes
    - Allowed roles/exceptions
    - `/maintenance` page
    - API protection behavior
    - Authentication and other required system routes during maintenance

---

## Pending Verification

- School Admin production verification (after password reset)
- Schools page direct navigation improvement

---

## Notes

Keep the application production-ready after every task.

Security: two P0 session-invalidation issues found and fixed during Change Email review — sessions were not invalidated on a user's first password change or first email change (commits `c201214`, `adb07dd`). See git history for details.
