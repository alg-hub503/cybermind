import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    checkoutUrl: "/billing",
  });
}