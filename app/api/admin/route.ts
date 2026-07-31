import { NextResponse } from "next/server";

import {
  requireAdmin,
  toApiError,
} from "@/lib/authorization";
import { getAdminStats } from "@/lib/services/stats.service";

export async function GET() {
  try {
    await requireAdmin();

    const stats = await getAdminStats();

    return NextResponse.json(stats);
  } catch (error) {
    const mapped = toApiError(error);

    return NextResponse.json(
      {
        error: mapped.error,
      },
      {
        status: mapped.status,
      }
    );
  }
}