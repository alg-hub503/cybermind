import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/get-server-session";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { type, description } = body;

  if (!type || !["BUG", "SUGGESTION"].includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  if (!description || typeof description !== "string" || description.trim().length === 0) {
    return NextResponse.json({ error: "Description is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const report = await prisma.report.create({
    data: {
      type,
      description: description.trim(),
      userId: user.id,
    },
  });

  return NextResponse.json({ id: report.id, success: true }, { status: 201 });
}
