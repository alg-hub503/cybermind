import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdminStats } from "@/lib/services/stats.service";

export async function GET() {
  try {
    await requireAdmin();

    const stats = await getAdminStats();

    return NextResponse.json(stats);
  } catch {
    return NextResponse.json(
      {
        error: "Forbidden",
      },
      {
        status: 403,
      }
    );
  }
}