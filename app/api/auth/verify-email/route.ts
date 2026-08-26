import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { NextResponse } from "next/server";

function sha256(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Invalid verification link" },
        { status: 400 }
      );
    }

    // Hash the incoming token and look up directly by tokenHash
    const tokenHash = sha256(token);

    const verification = await prisma.emailVerification.findUnique({
      where: { tokenHash },
      include: { user: { select: { id: true, emailVerifiedAt: true } } },
    });

    if (!verification) {
      return NextResponse.json(
        { error: "Invalid or expired verification link" },
        { status: 400 }
      );
    }

    // Check expiry
    if (verification.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Invalid or expired verification link" },
        { status: 400 }
      );
    }

    // Already verified
    if (verification.user.emailVerifiedAt) {
      return NextResponse.json({
        message: "Email already verified",
        alreadyVerified: true,
      });
    }

    // Mark email as verified and delete all verification tokens for this user
    await prisma.$transaction([
      prisma.user.update({
        where: { id: verification.userId },
        data: { emailVerifiedAt: new Date() },
      }),
      prisma.emailVerification.deleteMany({
        where: { userId: verification.userId },
      }),
    ]);

    return NextResponse.json({
      message: "Email verified successfully",
      email: verification.email,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
