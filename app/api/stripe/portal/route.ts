import { NextResponse } from "next/server";
import { requireSessionPermission, toApiError } from "@/lib/authorization";
import { ADMIN_ROLE } from "@/lib/constants";
import { createCustomerPortal } from "@/lib/services/application/billing/create-customer-portal";
import { toBillingHttpError } from "@/lib/services/application/billing/stripe-error";

export async function POST(req: Request) {
  // The Stripe portal can change the card, view invoices and cancel the plan,
  // so it needs MANAGE_BILLING (trial gate skipped, see cancel-subscription).
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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const url = await createCustomerPortal(schoolId, `${appUrl}/dashboard/billing`);

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Portal error:", error);
    const { status, error: message } = toBillingHttpError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
