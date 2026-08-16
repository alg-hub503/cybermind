import { NextRequest, NextResponse } from "next/server";
import { requireResourceAccess, toApiError } from "@/lib/authorization";
import { getGradeWithClasses } from "@/lib/features/grades/grade-actions";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const grade = await getGradeWithClasses(id);

  try {
    const { resource } = await requireResourceAccess(grade);
    return NextResponse.json(resource);
  } catch (e) {
    const apiError = toApiError(e);
    return NextResponse.json({ error: apiError.error }, { status: apiError.status });
  }
}
