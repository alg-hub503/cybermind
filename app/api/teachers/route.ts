import { NextResponse } from "next/server";
import { requireAuth, requirePermission, toApiError } from "@/lib/authorization";
import { ADMIN_ROLE } from "@/lib/constants";
import { getTeachers, getTeachersBySchool, createTeacher } from "@/lib/features/teachers/teacher-actions";
import { createTeacherSchema } from "@/lib/features/teachers/schemas/teacher.schema";
import { getSchoolById } from "@/lib/services/domain/school.service";

export async function GET() {
  const access = await requireAuth().catch(toApiError);
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
  const access = await requirePermission("MANAGE_TEACHERS").catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(access, { status: access.status });
  }
  const { user } = access;

  const body = await req.json();
  const parsed = createTeacherSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  if (user.role !== ADMIN_ROLE && user.schoolId !== parsed.data.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const school = await getSchoolById(parsed.data.schoolId);
  if (!school) {
    return NextResponse.json({ error: "School not found" }, { status: 400 });
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
