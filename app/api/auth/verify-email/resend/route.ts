import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/email";

const TOKEN_EXPIRY_HOURS = 24;
const RESEND_COOLDOWN_SECONDS = 60;

function sha256(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

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

    // Fetch user from DB — email is source of truth
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 400 }
      );
    }

    // Already verified
    if (user.emailVerifiedAt) {
      return NextResponse.json(
        { error: "Email already verified" },
        { status: 400 }
      );
    }

    // Check cooldown
    const lastVerification = await prisma.emailVerification.findFirst({
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
            error: "Please wait before requesting a new link",
            cooldownSeconds: RESEND_COOLDOWN_SECONDS - secondsSinceLastSend,
          },
          { status: 429 }
        );
      }
    }

    // Invalidate all existing tokens for this user
    await prisma.emailVerification.deleteMany({
      where: { userId },
    });

    // Generate new token
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = sha256(token);
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    await prisma.emailVerification.create({
      data: {
        userId,
        email: user.email,
        tokenHash,
        expiresAt,
      },
    });

    // Send verification email
    await sendVerificationEmail(user.email, token);

    return NextResponse.json({ message: "Verification email sent" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to resend verification email" },
      { status: 500 }
    );
  }
}
