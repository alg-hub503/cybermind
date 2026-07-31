import { NextRequest, NextResponse } from "next/server";

import {
  requireResourceAccess,
  toApiError,
} from "@/lib/authorization";
import { ADMIN_ROLE } from "@/lib/constants";
import { getAcademicYear, updateAcademicYear, deleteAcademicYear } from "@/lib/features/academic-years/academic-year-actions";
import { updateAcademicYearSchema } from "@/lib/features/academic-years/schemas/academic-year.schema";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const year = await getAcademicYear(id);
  const access = await requireResourceAccess(year).catch(toApiError);
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  return NextResponse.json(year);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const year = await getAcademicYear(id);
  const access = await requireResourceAccess(year).catch(toApiError);
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const body = await req.json();
  const parsed = updateAcademicYearSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.schoolId && access.user.role !== ADMIN_ROLE && parsed.data.schoolId !== access.user.schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const updated = await updateAcademicYear(id, parsed.data);
    return NextResponse.json(updated);
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2003") {
      return NextResponse.json({ error: "Referenced school does not exist" }, { status: 400 });
    }
    throw err;
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const year = await getAcademicYear(id);
  const access = await requireResourceAccess(year).catch(toApiError);
  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  await deleteAcademicYear(id);
  return NextResponse.json({ success: true });
}
