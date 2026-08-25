import { NextResponse } from "next/server";
import { requireAdmin, toApiError } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const access = await requireAdmin().catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(access, { status: access.status });
  }

  const users = await prisma.user.count();
  const clients = await prisma.client.count();

  return NextResponse.json({
    users,
    clients,
  });
}
