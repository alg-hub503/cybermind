import { NextResponse } from "next/server";
import { requireSessionPermission, toApiError } from "@/lib/authorization";
import { ADMIN_ROLE } from "@/lib/constants";
import { cancelSubscription } from "@/lib/services/application/billing/cancel-subscription";
import { toBillingHttpError } from "@/lib/services/application/billing/stripe-error";

export async function POST(req: Request) {
  // Cancelling is a billing action: MANAGE_BILLING is required, but the
  // trial gate is skipped so an expired school can still manage its plan.
  const access = await requireSessionPermission("MANAGE_BILLING").catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(access, { status: access.status });
  }
  const { user } = access;

  if (!user.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const schoolId =
      user.role === ADMIN_ROLE ? (body.schoolId ?? user.schoolId) : user.schoolId;

    await cancelSubscription(schoolId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    const { status, error: message } = toBillingHttpError(error);
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
