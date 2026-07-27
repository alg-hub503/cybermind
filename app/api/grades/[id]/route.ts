import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ADMIN_ROLE } from "@/lib/constants";
import { getGrade, updateGrade, deleteGrade } from "@/lib/features/grades/grade-actions";
import { updateGradeSchema } from "@/lib/features/grades/schemas/grade.schema";

async function requireAccess(gradeId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { error: "Unauthorized", status: 401 as const };
  }

  if (session.user.role === ADMIN_ROLE) {
    return { session };
  }

  const grade = await getGrade(gradeId);
  if (!grade) {
    return { error: "Not found", status: 404 as const };
  }

  if (grade.schoolId !== session.user.schoolId) {
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

  const grade = await getGrade(id);
  return NextResponse.json(grade);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await requireAccess(id);
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const body = await req.json();
  const parsed = updateGradeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.schoolId && access.session.user.role !== ADMIN_ROLE && parsed.data.schoolId !== access.session.user.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const grade = await updateGrade(id, parsed.data);
    return NextResponse.json(grade);
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "A grade with this name already exists in this school" }, { status: 409 });
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

  await deleteGrade(id);
  return NextResponse.json({ success: true });
}
