import { NextResponse } from "next/server";
import { cancelSubscription } from "@/lib/application/subscription/cancel-subscription";

export async function POST(request: Request) {
  const { subscriptionId } = await request.json();

  await cancelSubscription(subscriptionId);

  return NextResponse.json({ success: true });
}
