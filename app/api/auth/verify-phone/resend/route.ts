import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { sendSms, generateOtp } from "@/lib/sms";

const OTP_EXPIRY_MINUTES = 5;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_ACTIVE_OTPS = 3;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    // Fetch user from DB — phone is source of truth
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

    // Check cooldown
    const lastVerification = await prisma.phoneVerification.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (lastVerification) {
      const secondsSinceLastSend = Math.floor(
        (Date.now() - lastVerification.createdAt.getTime()) / 1000
      );
      if (secondsSinceLastSend < RESEND_COOLDOWN_SECONDS) {
        return NextResponse.json(
          {
            error: "Please wait before requesting a new code",
            cooldownSeconds: RESEND_COOLDOWN_SECONDS - secondsSinceLastSend,
          },
          { status: 429 }
        );
      }
    }

    // Invalidate all existing unused OTPs for this user
    await prisma.phoneVerification.updateMany({
      where: { userId, expiresAt: { gt: new Date() } },
      data: { expiresAt: new Date() },
    });

    // Limit active OTPs (cleanup old expired ones)
    const activeOtpCount = await prisma.phoneVerification.count({
      where: { userId },
    });
    if (activeOtpCount >= MAX_ACTIVE_OTPS) {
      await prisma.phoneVerification.deleteMany({
        where: { userId },
      });
    }

    // Generate new OTP
    const otp = generateOtp();
    const codeHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await prisma.phoneVerification.create({
      data: { userId, phone: user.phone, codeHash, expiresAt },
    });

    // Send OTP
    await sendSms(user.phone, `Your CyberMind verification code is: ${otp}. Valid for ${OTP_EXPIRY_MINUTES} minutes.`);

    return NextResponse.json({ message: "OTP resent" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to resend code" },
      { status: 500 }
    );
  }
}
