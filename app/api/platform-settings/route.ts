import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, toApiError } from "@/lib/authorization";
import {
  getPlatformSettings,
  updatePlatformSettings,
} from "@/lib/features/platform/platform-settings-actions";
import { platformSettingsSchema } from "@/lib/features/platform/schemas/platform-settings.schema";

export async function GET() {
  const access = await requireAdmin().catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(
      { error: access.error },
      { status: access.status }
    );
  }

  const settings = await getPlatformSettings();
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const access = await requireAdmin().catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(
      { error: access.error },
      { status: access.status }
    );
  }

  const body = await req.json();
  const parsed = platformSettingsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const settings = await updatePlatformSettings(parsed.data);
  return NextResponse.json(settings);
}
