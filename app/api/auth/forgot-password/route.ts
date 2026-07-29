import { NextResponse } from "next/server";
import { randomBytes, createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

const GENERIC_MESSAGE = "If an account exists for this email, a reset link has been sent.";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email ?? "").toLowerCase().trim();
    const user = email ? await prisma.user.findUnique({ where: { email } }) : null;

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

      await sendPasswordResetEmail(email, rawToken);
    }

    return NextResponse.json({ message: GENERIC_MESSAGE }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: GENERIC_MESSAGE }, { status: 200 });
  }
}
