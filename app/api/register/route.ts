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

    const hashedPassword = await bcrypt.hash(String(body.password), 12);

    const result = await prisma.$transaction(async (tx) => {
      const school = await tx.school.create({
        data: {
          name: `${body.email.split("@")[0]} School`,
        },
      });

      const platformSettings = await tx.platformSettings.findUnique({
        where: { id: "singleton" },
      });
      const duration = platformSettings?.trialDurationDays ?? 14;
      const now = new Date();

      await tx.schoolSettings.create({
        data: {
          schoolId: school.id,
          trialStart: now,
          trialEnd: new Date(now.getTime() + duration * 24 * 60 * 60 * 1000),
        },
      });

      const user = await tx.user.create({
        data: {
          email: body.email,
          name: body.name ?? null,
          password: hashedPassword,
          schoolId: school.id,
          role: "USER",
        },
      });

      return { user, school };
    });

    return NextResponse.json({
      id: result.user.id,
      email: result.user.email,
      schoolId: result.school.id,
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
