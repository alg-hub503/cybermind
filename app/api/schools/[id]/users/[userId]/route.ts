import { NextResponse } from "next/server";

import { requireSchoolAdmin, toApiError } from "@/lib/authorization";
import {
  deleteSchoolUser,
  RoleMismatchError,
  PlatformAdminProtectedError,
  LastSchoolAdminError,
} from "@/lib/features/users/delete-school-user";
import { updateSchoolUserName } from "@/lib/features/users/update-school-user";
import { updateSchoolUserNameSchema } from "@/lib/features/users/schemas/update-user.schema";

/**
 * Deletes (DELETE) or renames (PATCH) a user who belongs to this school.
 * Separate from .../users/[userId]/role (which only changes their
 * UserRole), and from the platform-level PATCH /api/users/[id]/role (which
 * toggles User.role) — neither this route nor that one touches the field
 * the other owns.
 */
function toDeleteHttpError(error: unknown): { status: number; error: string } {
  if (error instanceof RoleMismatchError) {
    return { status: 403, error: error.message };
  }
  if (error instanceof PlatformAdminProtectedError) {
    return { status: 403, error: error.message };
  }
  if (error instanceof LastSchoolAdminError) {
    return { status: 409, error: error.message };
  }
  return { status: 500, error: "Failed to delete user" };
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const { id: schoolId, userId } = await params;

  const access = await requireSchoolAdmin(schoolId).catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(access, { status: access.status });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateSchoolUserNameSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    await updateSchoolUserName({ schoolId, userId, name: parsed.data.name });
    return NextResponse.json({ success: true });
  } catch (err) {
    const { status, error } = toDeleteHttpError(err);
    return NextResponse.json({ error }, { status });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const { id: schoolId, userId } = await params;

  const access = await requireSchoolAdmin(schoolId).catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(access, { status: access.status });
  }
  const { user: actor } = access;

  if (actor.id === userId) {
    return NextResponse.json(
      { error: "Cannot delete your own account" },
      { status: 400 }
    );
  }

  try {
    await deleteSchoolUser({ schoolId, userId, actorId: actor.id });
    return NextResponse.json({ success: true });
  } catch (err) {
    const { status, error } = toDeleteHttpError(err);
    return NextResponse.json({ error }, { status });
  }
}
