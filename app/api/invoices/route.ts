import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      id: 1,
      amount: 500,
      status: "PAID",
    },
  ]);
}