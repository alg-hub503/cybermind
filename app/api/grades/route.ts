import { NextResponse } from "next/server";
import { requireAuth, requirePermission, toApiError } from "@/lib/authorization";

import { ADMIN_ROLE } from "@/lib/constants";
import { getGrades, getGradesBySchool, createGrade } from "@/lib/features/grades/grade-actions";
import { gradeSchema } from "@/lib/features/grades/schemas/grade.schema";

export async function GET() {
  const access = await requireAuth().catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(access, { status: access.status });
  }
  const { session } = access;

  if (session.user.role === ADMIN_ROLE) {
    const grades = await getGrades();
    return NextResponse.json(grades);
  }

  if (!session.user.schoolId) {
    return NextResponse.json({ error: "No school assigned" }, { status: 403 });
  }

  const grades = await getGradesBySchool(session.user.schoolId);
  return NextResponse.json(grades);
}

export async function POST(req: Request) {
  const access = await requirePermission("MANAGE_GRADES").catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(access, { status: access.status });
  }
  const { user } = access;

  const body = await req.json();
  const parsed = gradeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  if (user.role !== ADMIN_ROLE && parsed.data.schoolId !== user.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const grade = await createGrade(parsed.data);
    return NextResponse.json(grade, { status: 201 });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "A grade with this name already exists in this school" }, { status: 409 });
    }
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2003") {
      return NextResponse.json({ error: "Referenced school does not exist" }, { status: 400 });
    }
    throw err;
  }
}
