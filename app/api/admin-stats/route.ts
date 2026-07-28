import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/get-server-session";


import { ADMIN_ROLE } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== ADMIN_ROLE) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.count();
  const clients = await prisma.client.count();

  return NextResponse.json({
    users,
    clients,
  });
}
