import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // 🔥 FIX: ensure password is always hashed correctly
    const hashedPassword = await bcrypt.hash(String(body.password), 12);

    const school = await prisma.school.create({
      data: {
        name: `${body.email.split("@")[0]} School`,
      },
    });

    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: hashedPassword,
        schoolId: school.id,
        role: "USER",
        subscriptionStatus: "TRIAL",
      },
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      schoolId: school.id,
      message: "User and School created successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Register failed" },
      { status: 500 }
    );
  }
}