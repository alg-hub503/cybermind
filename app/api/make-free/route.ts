import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  await prisma.user.update({
    where: {
      email: "test@test.com",
    },
    data: {
      subscriptionStatus: "FREE",
    },
  });

  return NextResponse.json({
    success: true,
  });
}