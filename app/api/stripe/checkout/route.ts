import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

import { StripeGateway } from "@/lib/infrastructure/stripe/stripe-gateway";
import { startCheckout } from "@/lib/services/application/billing/commands/start-checkout";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || !session.user.schoolId) {
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
      schoolId: session.user.schoolId,
      email: session.user.email,
      name: session.user.name,
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