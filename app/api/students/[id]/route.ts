import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ADMIN_ROLE } from "@/lib/constants";
import { getStudent, updateStudent, deleteStudent } from "@/lib/features/students/student-actions";
import { updateStudentSchema } from "@/lib/features/students/schemas/student.schema";

async function requireAccess(studentId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { error: "Unauthorized", status: 401 as const };
  }

  if (session.user.role === ADMIN_ROLE) {
    return { session };
  }

  const student = await getStudent(studentId);
  if (!student) {
    return { error: "Not found", status: 404 as const };
  }

  if (student.schoolId !== session.user.schoolId) {
    return { error: "Forbidden", status: 403 as const };
  }

  return { session };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await requireAccess(id);
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const student = await getStudent(id);
  return NextResponse.json(student);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await requireAccess(id);
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const body = await req.json();
  const parsed = updateStudentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.schoolId && access.session.user.role !== ADMIN_ROLE && parsed.data.schoolId !== access.session.user.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const student = await updateStudent(id, parsed.data);
    return NextResponse.json(student);
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "A student with this code already exists in this school" }, { status: 409 });
    }
    throw err;
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await requireAccess(id);
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  await deleteStudent(id);
  return NextResponse.json({ success: true });
}
