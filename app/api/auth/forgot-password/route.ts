import { NextResponse } from "next/server";
import { randomBytes, createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { normalizeEmail } from "@/lib/auth-input";
import { findUserByLoginEmail } from "@/lib/services/domain/user.service";

const GENERIC_MESSAGE = "If an account exists for this email, a reset link has been sent.";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = normalizeEmail(body.email);
    const user = email ? await findUserByLoginEmail(email) : null;

    if (!user) {

      if (email) {
        await prisma.passwordResetToken.count({
          where: { createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) } },
        });
      }

      return NextResponse.json({ message: GENERIC_MESSAGE }, { status: 200 });
    }

    const recentTokens = await prisma.passwordResetToken.count({
      where: {
        userId: user.id,
        createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) },
      },
    });

    if (recentTokens < 3) {
      const rawToken = randomBytes(32).toString("hex");
      const tokenHash = createHash("sha256").update(rawToken).digest("hex");

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      });

      await sendPasswordResetEmail(user.email, rawToken);
    }

    return NextResponse.json({ message: GENERIC_MESSAGE }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: GENERIC_MESSAGE }, { status: 200 });
  }
}
