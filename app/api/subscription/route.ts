import { NextResponse } from "next/server";
import { createSubscription } from "@/lib/application/subscription/create-subscription";

export async function POST() {
  await createSubscription();

  return NextResponse.json({ success: true });
}
