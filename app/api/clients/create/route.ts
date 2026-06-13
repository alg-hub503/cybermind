import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();

  const client = await prisma.client.create({
    data: {
      name: body.name,
      schoolId: body.schoolId,
    },
  });

  return NextResponse.json(client);
}