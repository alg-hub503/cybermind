import { NextRequest, NextResponse } from "next/server";

import {
  requireResourceAccess,
  toApiError,
} from "@/lib/authorization";
import { ADMIN_ROLE } from "@/lib/constants";
import { getStudent, updateStudent, deleteStudent } from "@/lib/features/students/student-actions";
import { updateStudentSchema } from "@/lib/features/students/schemas/student.schema";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const student = await getStudent(id);
  const access = await requireResourceAccess(student).catch(toApiError);
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  return NextResponse.json(student);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const student = await getStudent(id);
  const access = await requireResourceAccess(student).catch(toApiError);
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const body = await req.json();
  const parsed = updateStudentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.schoolId && access.user.role !== ADMIN_ROLE && parsed.data.schoolId !== access.user.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const updated = await updateStudent(id, parsed.data);
    return NextResponse.json(updated);
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "A student with this code already exists in this school" }, { status: 409 });
    }
    throw err;
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const student = await getStudent(id);
  const access = await requireResourceAccess(student).catch(toApiError);
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  await deleteStudent(id);
  return NextResponse.json({ success: true });
}
