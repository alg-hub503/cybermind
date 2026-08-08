import { prisma } from "@/lib/prisma";
import type { EmailChangeToken } from "../types/email-change";

export class PrismaEmailChangeRepository {
  async createToken(userId: string, tokenHash: string, expiresAt: Date): Promise<EmailChangeToken> {
    return prisma.emailChangeToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    }) as unknown as EmailChangeToken;
  }

  async findTokenByHash(tokenHash: string): Promise<(EmailChangeToken & { user: { id: string; email: string } }) | null> {
    return prisma.emailChangeToken.findUnique({
      where: { tokenHash },
      include: { user: { select: { id: true, email: true } } },
    }) as unknown as (EmailChangeToken & { user: { id: string; email: string } }) | null;
  }

  async markTokenUsed(id: string): Promise<void> {
    await prisma.emailChangeToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  async deleteOldTokens(userId: string, excludeId: string): Promise<void> {
    await prisma.emailChangeToken.deleteMany({
      where: {
        userId,
        usedAt: null,
        id: { not: excludeId },
      },
    });
  }

  async findRecentTokens(userId: string, since: Date): Promise<number> {
    return prisma.emailChangeToken.count({
      where: {
        userId,
        createdAt: { gte: since },
      },
    });
  }

  async updateUserEmail(userId: string, newEmail: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        email: newEmail,
        pendingEmail: null,
        emailChangedAt: new Date(),
      },
    });
  }

  async setPendingEmail(userId: string, pendingEmail: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { pendingEmail },
    });
  }

  async findUserByEmail(email: string): Promise<{ id: string } | null> {
    return prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
  }

  async findUserById(id: string): Promise<{ id: string; email: string; password: string | null } | null> {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, password: true },
    });
  }

  async recordFailedPasswordAttempt(userId: string): Promise<void> {
    await prisma.emailChangeAttempt.create({
      data: { userId },
    });
  }

  async countRecentFailedAttempts(userId: string, since: Date): Promise<number> {
    return prisma.emailChangeAttempt.count({
      where: {
        userId,
        createdAt: { gte: since },
      },
    });
  }
}
