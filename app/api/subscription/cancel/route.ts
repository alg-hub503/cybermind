import { NextResponse } from "next/server";
import { cancelSubscription } from "@/lib/application/subscription/cancel-subscription";

export async function POST() {
  await cancelSubscription("demo-subscription-id");

  return NextResponse.json({
    success: true,
  });
}
