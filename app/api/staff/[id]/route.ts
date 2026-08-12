import { NextResponse } from "next/server";
import { requireSession, requirePermission, toApiError } from "@/lib/authorization";
import { ADMIN_ROLE } from "@/lib/constants";
import { getStaffMember, updateStaffMember, deleteStaffMember } from "@/lib/features/staff/staff-actions";
import { updateStaffSchema } from "@/lib/features/staff/schemas/staff.schema";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireSession().catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(access, { status: access.status });
  }
  const { session } = access;
  const { id } = await params;

  const staff = await getStaffMember(id);

  if (!staff) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (session.user.role !== ADMIN_ROLE && staff.schoolId !== session.user.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(staff);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requirePermission("MANAGE_STAFF").catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(access, { status: access.status });
  }
  const { user } = access;
  const { id } = await params;

  const staff = await getStaffMember(id);

  if (!staff) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (user.role !== ADMIN_ROLE && staff.schoolId !== user.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateStaffSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await updateStaffMember(id, parsed.data);
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requirePermission("MANAGE_STAFF").catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(access, { status: access.status });
  }
  const { user } = access;
  const { id } = await params;

  const staff = await getStaffMember(id);

  if (!staff) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (user.role !== ADMIN_ROLE && staff.schoolId !== user.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await deleteStaffMember(id);
  return NextResponse.json({ success: true });
}
