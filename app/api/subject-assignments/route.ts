import { NextResponse } from "next/server";
import {
  requireAuth,
  requirePermission,
  requireResourceAccess,
  toApiError,
} from "@/lib/authorization";

import { ADMIN_ROLE } from "@/lib/constants";
import { getClass } from "@/lib/features/classes/class-actions";
import {
  getSubjectAssignmentsBySchool,
  getSubjectAssignmentsByClass,
  createSubjectAssignment,
} from "@/lib/features/subject-assignments/subject-assignment-actions";
import { subjectAssignmentSchema } from "@/lib/features/subject-assignments/schemas/subject-assignment.schema";

export async function GET(req: Request) {
  const access = await requireAuth().catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(access, { status: access.status });
  }
  const { session } = access;

  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("classId");

  if (classId) {
    const classe = await getClass(classId);
    const classAccess = await requireResourceAccess(classe).catch(toApiError);
    if ("error" in classAccess) {
      return NextResponse.json({ error: classAccess.error }, { status: classAccess.status });
    }

    const assignments = await getSubjectAssignmentsByClass(classId);
    return NextResponse.json(assignments);
  }

  if (session.user.role !== ADMIN_ROLE && !session.user.schoolId) {
    return NextResponse.json({ error: "No school assigned" }, { status: 403 });
  }

  const schoolId = session.user.schoolId;
  if (!schoolId) {
    return NextResponse.json({ error: "No school assigned" }, { status: 403 });
  }

  const assignments = await getSubjectAssignmentsBySchool(schoolId);
  return NextResponse.json(assignments);
}

export async function POST(req: Request) {
  const access = await requirePermission("MANAGE_SUBJECT_ASSIGNMENTS").catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(access, { status: access.status });
  }
  const { user } = access;

  const body = await req.json();
  const parsed = subjectAssignmentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  if (user.role !== ADMIN_ROLE && parsed.data.schoolId !== user.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const assignment = await createSubjectAssignment(parsed.data);
    return NextResponse.json(assignment, { status: 201 });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "This teacher is already assigned to this subject for this class" }, { status: 409 });
    }
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2003") {
      return NextResponse.json({ error: "Referenced school, class, or teacher does not exist" }, { status: 400 });
    }
    throw err;
  }
}
