import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/get-server-session";

import { ADMIN_ROLE } from "@/lib/constants";
import { getAcademicYear, updateAcademicYear, deleteAcademicYear } from "@/lib/features/academic-years/academic-year-actions";
import { updateAcademicYearSchema } from "@/lib/features/academic-years/schemas/academic-year.schema";

async function requireAccess(academicYearId: string) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return { error: "Unauthorized", status: 401 as const };
  }

  if (session.user.role === ADMIN_ROLE) {
    return { session };
  }

  const year = await getAcademicYear(academicYearId);
  if (!year) {
    return { error: "Not found", status: 404 as const };
  }

  if (year.schoolId !== session.user.schoolId) {
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

  const year = await getAcademicYear(id);
  return NextResponse.json(year);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await requireAccess(id);
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const body = await req.json();
  const parsed = updateAcademicYearSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.schoolId && access.session.user.role !== ADMIN_ROLE && parsed.data.schoolId !== access.session.user.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const year = await updateAcademicYear(id, parsed.data);
    return NextResponse.json(year);
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2003") {
      return NextResponse.json({ error: "Referenced school does not exist" }, { status: 400 });
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

  await deleteAcademicYear(id);
  return NextResponse.json({ success: true });
}
