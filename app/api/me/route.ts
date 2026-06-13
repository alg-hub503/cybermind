import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await prisma.user.findUnique({
    where: {
      email: "test@test.com",
    },
  });

  return NextResponse.json(user);
}