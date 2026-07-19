import { NextResponse } from "next/server";
import { resumeSubscription } from "@/lib/application/subscription/resume-subscription";

export async function POST(request: Request) {
  const { subscriptionId } = await request.json();

  await resumeSubscription(subscriptionId);

  return NextResponse.json({
    success: true,
  });
}
