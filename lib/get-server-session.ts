import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

interface SessionUser {
  id: string;
  email: string;
  role: string;
  schoolId: string | null;
  subscriptionStatus: string;
  name?: string | null;
  emailChangedAt?: Date | null;
}

interface Session {
  user: SessionUser;
  expires: string;
}

export async function getServerSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const cookiesObj: Record<string, string> = {};
  for (const { name, value } of allCookies) {
    cookiesObj[name] = value;
  }

  const token = await getToken({
    req: { cookies: cookiesObj } as unknown as NextRequest,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.email) return null;

  const dbUser = await prisma.user.findUnique({
    where: { email: token.email as string },
    select: { passwordChangedAt: true, emailChangedAt: true },
  });

  if (dbUser) {
    const tokenPasswordChangedAt = token.passwordChangedAt
      ? new Date(token.passwordChangedAt)
      : null;

    if (
      tokenPasswordChangedAt &&
      dbUser.passwordChangedAt &&
      dbUser.passwordChangedAt > tokenPasswordChangedAt
    ) {
      return null;
    }

    if (dbUser.emailChangedAt) {
      const tokenEmailChangedAt = token.emailChangedAt
        ? new Date(token.emailChangedAt)
        : null;

      if (
        !tokenEmailChangedAt ||
        dbUser.emailChangedAt > tokenEmailChangedAt
      ) {
        return null;
      }
    }
  }

  return {
    user: {
      id: (token.sub ?? token.id) as string,
      email: token.email as string,
      role: token.role as string,
      schoolId: token.schoolId as string | null,
      subscriptionStatus: (token.subscriptionStatus as string) ?? "TRIAL",
      name: (token.name as string) ?? null,
      emailChangedAt: token.emailChangedAt as Date | null,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}
