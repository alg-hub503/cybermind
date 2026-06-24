import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const clients = await prisma.client.count();

    const schools = await prisma.school.count();

    const users = await prisma.user.count();

    return NextResponse.json({
      clients,
      schools,
      users,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        clients: 0,
        schools: 0,
        users: 0,
      },
      { status: 500 }
    );
  }
}