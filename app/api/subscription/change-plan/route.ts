import { NextResponse } from "next/server";
import { changeSubscriptionPlan } from "@/lib/application/subscription/change-subscription-plan";

export async function POST(request: Request) {
  const { subscriptionId, priceId } = await request.json();

  await changeSubscriptionPlan(subscriptionId, priceId);

  return NextResponse.json({ success: true });
}
