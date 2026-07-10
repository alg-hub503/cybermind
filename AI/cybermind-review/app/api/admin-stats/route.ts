import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const users = await prisma.user.count();
  const clients = await prisma.client.count();

  return NextResponse.json({
    users,
    clients,
  });
}