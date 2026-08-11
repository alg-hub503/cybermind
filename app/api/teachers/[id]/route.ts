import { NextResponse } from "next/server";
import { requireSession, toApiError } from "@/lib/authorization";
import { ADMIN_ROLE } from "@/lib/constants";
import { getTeacher, updateTeacher, deleteTeacher } from "@/lib/features/teachers/teacher-actions";
import { updateTeacherSchema } from "@/lib/features/teachers/schemas/teacher.schema";

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

  const teacher = await getTeacher(id);

  if (!teacher) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (session.user.role !== ADMIN_ROLE && teacher.schoolId !== session.user.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(teacher);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireSession().catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(access, { status: access.status });
  }
  const { session } = access;
  const { id } = await params;

  if (session.user.role !== ADMIN_ROLE) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const teacher = await getTeacher(id);

  if (!teacher) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (session.user.schoolId && teacher.schoolId !== session.user.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateTeacherSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await updateTeacher(id, parsed.data);
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireSession().catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(access, { status: access.status });
  }
  const { session } = access;
  const { id } = await params;

  if (session.user.role !== ADMIN_ROLE) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const teacher = await getTeacher(id);

  if (!teacher) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (session.user.schoolId && teacher.schoolId !== session.user.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await deleteTeacher(id);
  return NextResponse.json({ success: true });
}
