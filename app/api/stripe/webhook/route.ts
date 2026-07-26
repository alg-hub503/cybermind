import { NextResponse } from "next/server";
import Stripe from "stripe";
import { dispatchStripeEvent } from "@/lib/services/application/billing/webhooks/dispatch-stripe-event";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  console.log("WEBHOOK: received POST, body length:", body.length, "signature present:", !!signature, "webhook secret set:", !!process.env.STRIPE_WEBHOOK_SECRET);

  if (!signature) {
    console.log("WEBHOOK: missing stripe-signature header");
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.log("WEBHOOK: STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Server config error" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error("WEBHOOK: constructEvent failed", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  console.log("WEBHOOK: verified event type:", event.type, "id:", event.id);

  await dispatchStripeEvent(event);

  return NextResponse.json({ received: true });
}
