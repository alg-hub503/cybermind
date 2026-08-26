import { NextResponse } from "next/server";
import { requireSchoolAdmin, toApiError } from "@/lib/authorization";
import { getRole, updateRole, deleteRole } from "@/lib/features/roles/role-actions";
import { updateRoleSchema } from "@/lib/features/roles/schemas/role.schema";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; roleId: string }> }
) {
  const { id, roleId } = await params;

  const access = await requireSchoolAdmin(id).catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(access, { status: access.status });
  }

  const role = await getRole(roleId);

  if (!role || role.schoolId !== id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(role);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; roleId: string }> }
) {
  const { id, roleId } = await params;

  const access = await requireSchoolAdmin(id).catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(access, { status: access.status });
  }

  const role = await getRole(roleId);

  if (!role || role.schoolId !== id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = updateRoleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  // Protection: cannot change systemKey (check raw body)
  if (body.systemKey !== undefined) {
    return NextResponse.json({ error: "Cannot change systemKey" }, { status: 400 });
  }

  try {
    const updated = await updateRole(roleId, parsed.data);
    return NextResponse.json(updated);
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "A role with this name already exists in this school" }, { status: 409 });
    }
    throw err;
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; roleId: string }> }
) {
  const { id, roleId } = await params;

  const access = await requireSchoolAdmin(id).catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(access, { status: access.status });
  }

  const role = await getRole(roleId);

  if (!role || role.schoolId !== id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Protection 1: Cannot delete SCHOOL_ADMIN role
  if (role.systemKey === "SCHOOL_ADMIN") {
    return NextResponse.json(
      { error: "Cannot delete school admin role" },
      { status: 400 }
    );
  }

  // Protection 2: Cannot delete role with assigned users
  const assignedUsers = await prisma.userRole.count({
    where: { roleId },
  });

  if (assignedUsers > 0) {
    return NextResponse.json(
      {
        error: "Cannot delete role with assigned users",
        assignedUsers,
        message: "Reassign users to another role before deleting"
      },
      { status: 400 }
    );
  }

  await deleteRole(roleId);
  return NextResponse.json({ success: true });
}
