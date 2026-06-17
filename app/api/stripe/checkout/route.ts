import { NextResponse } from "next/server";
import Stripe from "stripe";
import { requireAuth } from "@/lib/require-auth";

export async function POST() {
   const stripeSecretKey =
    process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    return NextResponse.json(
      { error: "Stripe key missing" },
      { status: 500 }
    );
  }

  const stripe = new Stripe(stripeSecretKey);

  const session = await requireAuth();

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const checkoutSession =
    await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",

      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Premium School Plan",
            },
            unit_amount: 2000,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],

      success_url: `${process.env.NEXTAUTH_URL}/dashboard`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing`,

      customer_email:
        session.user?.email ?? undefined,
    });

  return NextResponse.json({
    url: checkoutSession.url,
  });
}