import { NextResponse } from "next/server";
import { resumeSubscription } from "@/lib/application/subscription/resume-subscription";

export async function POST() {
  await resumeSubscription("demo-subscription-id");

  return NextResponse.json({
    success: true,
  });
}
