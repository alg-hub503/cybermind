import { NextResponse } from "next/server";
import { changeSubscriptionPlan } from "@/lib/application/subscription/change-subscription-plan";

export async function POST() {
  await changeSubscriptionPlan(
    "demo-subscription-id",
    "pro"
  );

  return NextResponse.json({
    success: true,
  });
}
