import { NextRequest, NextResponse } from "next/server";
import { requireResourceAccess, toApiError } from "@/lib/authorization";
import { getClassWithDetails } from "@/lib/features/classes/class-actions";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cls = await getClassWithDetails(id);

  try {
    const { resource } = await requireResourceAccess(cls);
    return NextResponse.json(resource);
  } catch (e) {
    const apiError = toApiError(e);
    return NextResponse.json({ error: apiError.error }, { status: apiError.status });
  }
}
