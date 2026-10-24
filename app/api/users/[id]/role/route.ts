import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, toApiError } from "@/lib/authorization";
import { getUserById, updateUserRole } from "@/lib/services/user.service";
import { userRoleSchoolIdInvariant } from "@/lib/features/users/schemas/platform-role.schema";

const ADMIN_ROLE = "ADMIN";
const USER_ROLE = "USER";

/**
 * Toggles a user's PLATFORM role (User.role). Unrelated to
 * .../schools/[id]/users/[userId]/role, which changes a school-scoped
 * UserRole — neither route touches the field the other owns.
 *
 * Enforces RULES.md's ADMIN/USER schoolId contract (see
 * lib/features/users/schemas/platform-role.schema.ts) rather than only
 * flipping `role`, which is what let a promoted user keep their old
 * schoolId in production (ADMIN with schoolId set is invalid).
 *
 * Promoting (USER -> ADMIN) always clears schoolId: unambiguous. Demoting
 * (ADMIN -> USER) keeps whatever schoolId the row already has — for a
 * normal ADMIN that's null, so the invariant check below blocks the demote
 * (this one-click button has no way to collect a destination school); for
 * an already-invalid "stray" ADMIN that still has a schoolId, demoting
 * resolves it back into a normal USER of that school.
 */
export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const access = await requireAdmin().catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(access, { status: access.status });
  }

  if (access.user.id === id) {
    return NextResponse.json(
      { error: "Cannot change your own role" },
      { status: 400 }
    );
  }

  const targetUser = await getUserById(id);
  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const promoting = targetUser.role !== ADMIN_ROLE;
  const newRole = promoting ? ADMIN_ROLE : USER_ROLE;
  const newSchoolId = promoting ? null : targetUser.schoolId;

  const invariant = userRoleSchoolIdInvariant.safeParse({
    role: newRole,
    schoolId: newSchoolId,
  });

  if (!invariant.success) {
    return NextResponse.json(
      {
        error:
          "Demoting a platform admin to a school user requires a destination school, which this quick-toggle doesn't collect. Assign them to a school first.",
      },
      { status: 400 }
    );
  }

  try {
    const updated = await updateUserRole(id, newRole, newSchoolId);
    return NextResponse.json({ role: updated.role });
  } catch {
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    );
  }
}
