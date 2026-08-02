import { NextRequest, NextResponse } from "next/server";
import {
  requireSchoolAccess,
  toApiError,
} from "@/lib/authorization";
import {
  getSchoolSettings,
  updateSchoolSettings,
} from "@/lib/features/schools/school-settings-actions";
import { schoolSettingsSchema } from "@/lib/features/schools/schemas/school-settings.schema";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const access = await requireSchoolAccess(id).catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(
      { error: access.error },
      { status: access.status }
    );
  }

  const settings = await getSchoolSettings(id);
  return NextResponse.json(settings);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const access = await requireSchoolAccess(id).catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(
      { error: access.error },
      { status: access.status }
    );
  }

  const body = await req.json();
  const parsed = schoolSettingsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const settings = await updateSchoolSettings(id, parsed.data);
  return NextResponse.json(settings);
}
