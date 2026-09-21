import { NextResponse } from "next/server";
import { requireSessionPermission, toApiError } from "@/lib/authorization";

import { StripeGateway } from "@/lib/infrastructure/stripe/stripe-gateway";
import { startCheckout } from "@/lib/services/application/billing/commands/start-checkout";

export async function POST() {
  try {
    // Starting a paid plan needs MANAGE_BILLING. The trial gate is skipped on
    // purpose: an expired school must still be able to upgrade.
    const access = await requireSessionPermission("MANAGE_BILLING").catch(toApiError);
    if ("error" in access) {
      return NextResponse.json(access, { status: access.status });
    }
    const { user } = access;

    if (!user.schoolId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const priceId = process.env.STRIPE_PRICE_ID;

    if (!priceId) {
      return NextResponse.json(
        { error: "Missing STRIPE_PRICE_ID" },
        { status: 500 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!appUrl) {
      return NextResponse.json(
        { error: "Missing NEXT_PUBLIC_APP_URL" },
        { status: 500 }
      );
    }

    const gateway = new StripeGateway();

    const checkoutUrl = await startCheckout(gateway, {
      schoolId: user.schoolId,
      email: user.email,
      name: user.name,
      priceId,
      successUrl: `${appUrl}/dashboard`,
      cancelUrl: `${appUrl}/upgrade`,
    });

    return NextResponse.json({
      url: checkoutUrl,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Checkout failed" },
      { status: 500 }
    );
  }
}
