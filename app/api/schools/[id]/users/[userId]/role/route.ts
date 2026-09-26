import { NextResponse } from "next/server";

import { requireSchoolAdmin, toApiError } from "@/lib/authorization";
import { assignUserRoleSchema } from "@/lib/features/roles/schemas/user-role.schema";
import {
  assignUserRole,
  removeUserRole,
  LastSchoolAdminError,
  RoleMismatchError,
} from "@/lib/features/roles/user-role-actions";

/**
 * Assign (PUT) or remove (DELETE) the school-scoped role a user holds within
 * one school. This is separate from PATCH /api/users/[id]/role, which
 * toggles a user's PLATFORM role (User.role: "ADMIN" | "USER") and is
 * unrelated to this endpoint — neither route touches the field the other
 * one owns.
 */

function toRoleActionHttpError(
  error: unknown
): { status: number; error: string } {
  if (error instanceof RoleMismatchError) {
    return { status: 403, error: error.message };
  }
  if (error instanceof LastSchoolAdminError) {
    return { status: 409, error: error.message };
  }
  return { status: 500, error: "Failed to update role" };
}

export async function PUT(
  req: Request,
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
      { error: "Cannot change your own role" },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = assignUserRoleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const result = await assignUserRole({
      schoolId,
      userId,
      roleId: parsed.data.roleId,
      actorId: actor.id,
    });
    return NextResponse.json(result);
  } catch (err) {
    const { status, error } = toRoleActionHttpError(err);
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
      { error: "Cannot change your own role" },
      { status: 400 }
    );
  }

  try {
    const result = await removeUserRole({
      schoolId,
      userId,
      actorId: actor.id,
    });
    return NextResponse.json(result);
  } catch (err) {
    const { status, error } = toRoleActionHttpError(err);
    return NextResponse.json({ error }, { status });
  }
}
