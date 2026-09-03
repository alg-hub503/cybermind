import { NextResponse } from "next/server";
import { requireSession, toApiError } from "@/lib/authorization";
import { createCustomerPortal } from "@/lib/services/application/billing/create-customer-portal";

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
    const schoolId = session.user.role === "ADMIN"
      ? (body.schoolId ?? session.user.schoolId)
      : session.user.schoolId;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const url = await createCustomerPortal(schoolId, `${appUrl}/dashboard/billing`);

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Portal error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Portal creation failed" },
      { status: 500 }
    );
  }
}
