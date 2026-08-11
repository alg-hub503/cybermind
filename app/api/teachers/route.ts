import { NextResponse } from "next/server";
import { requireSession, toApiError } from "@/lib/authorization";
import { ADMIN_ROLE } from "@/lib/constants";
import { getTeachers, getTeachersBySchool, createTeacher } from "@/lib/features/teachers/teacher-actions";
import { createTeacherSchema } from "@/lib/features/teachers/schemas/teacher.schema";

export async function GET() {
  const access = await requireSession().catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(access, { status: access.status });
  }
  const { session } = access;

  if (session.user.role === ADMIN_ROLE) {
    const teachers = await getTeachers();
    return NextResponse.json(teachers);
  }

  if (!session.user.schoolId) {
    return NextResponse.json({ error: "No school assigned" }, { status: 403 });
  }

  const teachers = await getTeachersBySchool(session.user.schoolId);
  return NextResponse.json(teachers);
}

export async function POST(req: Request) {
  const access = await requireSession().catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(access, { status: access.status });
  }
  const { session } = access;

  if (session.user.role !== ADMIN_ROLE) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createTeacherSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.schoolId !== session.user.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const teacher = await createTeacher(parsed.data);
    return NextResponse.json(teacher, { status: 201 });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
    }
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2003") {
      return NextResponse.json({ error: "Referenced school does not exist" }, { status: 400 });
    }
    throw err;
  }
}
