import { NextResponse } from "next/server";
import { requireSession, toApiError } from "@/lib/authorization";


import { ADMIN_ROLE } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const access = await requireSession().catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(access, { status: access.status });
  }
  const { session } = access;

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
