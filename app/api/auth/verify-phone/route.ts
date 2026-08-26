import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

const MAX_ATTEMPTS = 5;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, code } = body;

    if (!userId || !code) {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    // Fetch user — phone is source of truth
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.phone) {
      return NextResponse.json(
        { error: "User not found or no phone number" },
        { status: 400 }
      );
    }

    // Already verified
    if (user.phoneVerifiedAt) {
      return NextResponse.json(
        { error: "Phone already verified" },
        { status: 400 }
      );
    }

    // Find the latest valid, non-expired OTP for this user
    const verification = await prisma.phoneVerification.findFirst({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!verification) {
      return NextResponse.json(
        { error: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    // Check attempts on THIS specific OTP
    if (verification.attempts >= MAX_ATTEMPTS) {
      // Invalidate this OTP
      await prisma.phoneVerification.update({
        where: { id: verification.id },
        data: { expiresAt: new Date() },
      });
      return NextResponse.json(
        { error: "Too many attempts. Please request a new code." },
        { status: 400 }
      );
    }

    // Increment attempts
    await prisma.phoneVerification.update({
      where: { id: verification.id },
      data: { attempts: { increment: 1 } },
    });

    // Verify code against this OTP's hash
    const isValid = await bcrypt.compare(code, verification.codeHash);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Success: mark phone as verified
    await prisma.user.update({
      where: { id: userId },
      data: { phoneVerifiedAt: new Date() },
    });

    // Invalidate ALL verification codes for this user (cannot reuse)
    await prisma.phoneVerification.deleteMany({
      where: { userId },
    });

    return NextResponse.json({
      message: "Phone verified successfully",
      userId: user.id,
      email: user.email,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
