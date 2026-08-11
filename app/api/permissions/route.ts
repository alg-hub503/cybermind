import { NextResponse } from "next/server";
import { requireAdmin, toApiError } from "@/lib/authorization";
import { getPermissions } from "@/lib/features/permissions/permission-actions";

export async function GET() {
  const access = await requireAdmin().catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(access, { status: access.status });
  }

  const permissions = await getPermissions();
  return NextResponse.json(permissions);
}
