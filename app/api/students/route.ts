import { NextResponse } from "next/server";
import { requireSession, toApiError } from "@/lib/authorization";

import { ADMIN_ROLE } from "@/lib/constants";
import { getStudents, getStudentsBySchool, createStudent } from "@/lib/features/students/student-actions";
import { studentSchema } from "@/lib/features/students/schemas/student.schema";

export async function GET() {
  const access = await requireSession().catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(access, { status: access.status });
  }
  const { session } = access;

  if (session.user.role === ADMIN_ROLE) {
    const students = await getStudents();
    return NextResponse.json(students);
  }

  if (!session.user.schoolId) {
    return NextResponse.json({ error: "No school assigned" }, { status: 403 });
  }

  const students = await getStudentsBySchool(session.user.schoolId);
  return NextResponse.json(students);
}

export async function POST(req: Request) {
  const access = await requireSession().catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(access, { status: access.status });
  }
  const { session } = access;

  const body = await req.json();
  const parsed = studentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  if (session.user.role !== ADMIN_ROLE && parsed.data.schoolId !== session.user.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const student = await createStudent(parsed.data);
    return NextResponse.json(student, { status: 201 });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "A student with this code already exists in this school" }, { status: 409 });
    }
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2003") {
      return NextResponse.json({ error: "Referenced school does not exist" }, { status: 400 });
    }
    throw err;
  }
}
