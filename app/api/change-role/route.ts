import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();

  await prisma.user.update({
    where: {
      email: body.email,
    },
    data: {
      role: body.role,
    },
  });

  return NextResponse.json({
    success: true,
  });
}