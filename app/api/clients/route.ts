import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// 🔐 GET USER SAFE
async function getUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) return null;

  let user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  // 🏫 إذا لا يوجد School → ننشئ واحدة تلقائياً
  if (user && !user.schoolId) {
    const school = await prisma.school.create({
      data: {
        name: "Default School",
      },
    });

    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        schoolId: school.id,
      },
    });
  }

  return user;
}

// 📦 GET CLIENTS
export async function GET() {
  const user = await getUser();

  if (!user) {
    return NextResponse.json([]);
  }

  const clients = await prisma.client.findMany({
    where: {
      schoolId: user.schoolId,
    },
  });

  return NextResponse.json(clients);
}

// ➕ CREATE CLIENT
export async function POST(req: Request) {
  const body = await req.json();
  const user = await getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const client = await prisma.client.create({
    data: {
      name: body.name,
      schoolId: user.schoolId,
    },
  });

  return NextResponse.json(client);
}

// ✏️ UPDATE CLIENT
export async function PUT(req: Request) {
  const body = await req.json();

  const client = await prisma.client.update({
    where: { id: body.id },
    data: { name: body.name },
  });

  return NextResponse.json(client);
}

// ❌ DELETE CLIENT
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Missing id" },
      { status: 400 }
    );
  }

  await prisma.client.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}