import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuth, toApiError } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

const avatarSchema = z.object({
  avatarUrl: z
    .string()
    .nullable()
    .refine((v) => v === null || v === "" || isHttpsUrl(v), {
      message: "Avatar URL must be a valid https:// link",
    }),
});

export async function GET() {
  const access = await requireAuth().catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(access, { status: access.status });
  }
  const { user } = access;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { avatarUrl: true },
  });

  return NextResponse.json({ avatarUrl: dbUser?.avatarUrl ?? null });
}

export async function PUT(req: Request) {
  const access = await requireAuth().catch(toApiError);
  if ("error" in access) {
    return NextResponse.json(access, { status: access.status });
  }
  const { user } = access;

  const body = await req.json();
  const parsed = avatarSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const avatarUrl = parsed.data.avatarUrl || null;

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { avatarUrl },
    select: { avatarUrl: true },
  });

  return NextResponse.json(updated);
}
