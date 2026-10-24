import { z } from "zod";

/**
 * RULES.md — "Design Constraint — ADMIN and USER SchoolId Contract":
 * ADMIN role must always have schoolId = null. USER role must always have
 * schoolId non-null. "Any code that creates or updates a User must reject
 * payloads that violate this constraint before reaching the database."
 *
 * This is that validation layer, applied to the {role, schoolId} pair a
 * write is about to commit — not to the raw request body, since this
 * specific endpoint (PATCH /api/users/[id]/role) takes none.
 */
export const userRoleSchoolIdInvariant = z.union([
  z.object({ role: z.literal("ADMIN"), schoolId: z.null() }),
  z.object({ role: z.literal("USER"), schoolId: z.string().min(1) }),
]);
