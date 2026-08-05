# Create User — Verification Checklist

## Feature

Create a new user in a school via `/dashboard/schools/{id}/users/new`.

---

## 1. Open Create User Page

| Field | Details |
|-------|---------|
| **URL** | `https://cybermind-rosy.vercel.app/dashboard/schools/{schoolId}/users/new` |
| **Expected Behavior** | Create User form appears |
| **Network Request** | None (normal page load) |
| **Database Change** | None |
| **UI Result** | Form with Name, Email, Password, Role, "Create User" button |
| **Pass/Fail** | ✅ Page loads without errors |

---

## 2. Fill Form

| Field | Details |
|-------|---------|
| **URL** | Same page |
| **Expected Behavior** | All fields can be filled |
| **Network Request** | None |
| **Database Change** | None |
| **UI Result** | Fields are populated |
| **Pass/Fail** | ✅ Can type in all fields |

---

## 3. Click Create User

| Field | Details |
|-------|---------|
| **URL** | Same page |
| **Expected Behavior** | Button changes to "Creating..." and becomes disabled |
| **Network Request** | A Server Action request completes successfully (typically HTTP 200). No browser console errors |
| **Database Change** | New row in `User` table |
| **UI Result** | Button shows "Creating..." |
| **Pass/Fail** | ✅ Button changes and works |

---

## 4. Redirect After Creation

| Field | Details |
|-------|---------|
| **URL** | `https://cybermind-rosy.vercel.app/dashboard/schools/{schoolId}/users` |
| **Expected Behavior** | Automatic redirect to users list page |
| **Network Request** | None (client-side redirect) |
| **Database Change** | New user exists |
| **UI Result** | Users list page |
| **Pass/Fail** | ✅ Redirect happens |

---

## 5. Verify List

| Field | Details |
|-------|---------|
| **URL** | `https://cybermind-rosy.vercel.app/dashboard/schools/{schoolId}/users` |
| **Expected Behavior** | New user appears in the list |
| **Network Request** | `GET` to fetch users list |
| **Expected Status** | `200` |
| **Database Change** | None |
| **UI Result** | New user visible in table |
| **Pass/Fail** | ✅ User exists |

---

## 6. Verify Database

| Field | Details |
|-------|---------|
| **Action** | `SELECT id, email, role, schoolId FROM "User" WHERE email = 'test@example.com'` |
| **Expected Result** | Single row with non-null `schoolId` |
| **Pass/Fail** | ✅ User exists and linked to school |

---

## 7. Test Login

| Field | Details |
|-------|---------|
| **URL** | `https://cybermind-rosy.vercel.app/login` |
| **Expected Behavior** | Login with new email and password |
| **Network Request** | `POST` to `/api/auth/callback/credentials` |
| **Expected Status** | `200` |
| **Database Change** | None |
| **UI Result** | Redirect to Dashboard |
| **Pass/Fail** | ✅ Login successful |

---

## 8. Runtime Logs

| Field | Details |
|-------|---------|
| **Location** | Vercel → Functions → Logs |
| **Expected** | No unhandled exceptions. No unexpected Prisma errors |
| **Pass** | No errors during Create User execution |
| **Fail** | Stack trace or runtime error present |

---

## 9. Test Validation (Negative Test)

| Field | Details |
|-------|---------|
| **Action** | Leave a required field (Email or Password) empty |
| **Expected** | Request is not sent or rejected with clear Validation message |
| **Network Request** | None (client-side validation) or Server Action (HTTP 400) |
| **Database Change** | None |
| **UI Result** | User is not created |
| **Pass/Fail** | ✅ User is not created |

---

## 10. Test Authorization (Negative Test)

| Field | Details |
|-------|---------|
| **Action** | Login as USER and try to open Create User page directly |
| **Expected** | The response must match the application's authorization policy (Redirect, 403, or 404). The important requirement is that the USER cannot access the page or create a user |
| **Network Request** | Server Action request (HTTP 403) or Redirect |
| **Database Change** | None |
| **UI Result** | USER cannot create a user |
| **Pass/Fail** | ✅ USER cannot create a user |

---

## 11. Test Duplicate Email (Negative Test)

| Field | Details |
|-------|---------|
| **Action** | Create a user with the same email again |
| **Expected** | No new user is created |
| **Network Request** | Server Action request (HTTP 200 or 400) |
| **Database Change** | None (no new user) |
| **UI Result** | Error message appears |
| **Additional** | User stays on same page, no redirect |
| **Database Check** | User count does not change |
| **Pass/Fail** | ✅ Error message appears and no duplicate |

---

## Failure Diagnosis

| Layer | Check |
|-------|-------|
| UI | Does button work? Does message appear? |
| Validation | Is input validated before submission? |
| Server Action | Is `createSchoolUser()` invoked? |
| Authorization | Does `requireSchoolAccess()` succeed? |
| Service | Does `createSchoolUserCore()` work? |
| Prisma | Is `prisma.user.create()` successful? |
| Database | Is row present after creation? |

---

## Summary

| Test | Status |
|------|--------|
| UI | ⬜ PASS / ⬜ FAIL |
| Validation | ⬜ PASS / ⬜ FAIL |
| Authorization | ⬜ PASS / ⬜ FAIL |
| Database | ⬜ PASS / ⬜ FAIL |
| Runtime Logs | ⬜ PASS / ⬜ FAIL |
| Negative Tests | ⬜ PASS / ⬜ FAIL |
| **Overall Result** | ⬜ PASS / ⬜ FAIL |
