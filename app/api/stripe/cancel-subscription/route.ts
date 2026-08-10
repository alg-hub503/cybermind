import { NextResponse } from "next/server";
import { requireSession, toApiError } from "@/lib/authorization";
import { cancelSubscription } from "@/lib/services/application/billing/cancel-subscription";

export async function POST(req: Request) {
  try {
    const access = await requireSession().catch(toApiError);
    if ("error" in access) {
      return NextResponse.json(access, { status: access.status });
    }
    const { session } = access;

    if (!session.user.schoolId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const schoolId = body.schoolId ?? session.user.schoolId;

    if (schoolId !== session.user.schoolId && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await cancelSubscription(schoolId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Cancel failed" },
      { status: 500 }
    );
  }
}
