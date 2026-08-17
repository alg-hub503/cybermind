import { NextRequest, NextResponse } from "next/server";
import { requireResourceAccess, toApiError } from "@/lib/authorization";
import { getStudentWithDetails } from "@/lib/features/students/student-actions";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const student = await getStudentWithDetails(id);

  try {
    const { resource } = await requireResourceAccess(student);
    return NextResponse.json(resource);
  } catch (e) {
    const apiError = toApiError(e);
    return NextResponse.json({ error: apiError.error }, { status: apiError.status });
  }
}
