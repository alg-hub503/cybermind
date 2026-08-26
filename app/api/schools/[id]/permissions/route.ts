import { NextResponse } from "next/server";
import { requireSchoolAdmin, toApiError } from "@/lib/authorization";
import { getPermissions } from "@/lib/features/permissions/permission-actions";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const access = await requireSchoolAdmin(id).catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(access, { status: access.status });
  }

  const permissions = await getPermissions();
  return NextResponse.json(permissions);
}
