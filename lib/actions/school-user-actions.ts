"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

import { requireSchoolAccess } from "@/lib/authorization";
import { ADMIN_ROLE } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function createSchoolUser(data: {
  schoolId: string;
  name: string;
  email: string;
  password: string;
  role: "USER" | "ADMIN";
}) {
  const { user: caller } = await requireSchoolAccess(data.schoolId);

  if (!data.schoolId || !data.name?.trim()) {
    throw new Error("INVALID_INPUT");
  }

  if (!EMAIL_PATTERN.test(data.email)) {
    throw new Error("INVALID_INPUT");
  }

  if (!data.password || data.password.length < 6) {
    throw new Error("INVALID_INPUT");
  }

  const role = caller.role === ADMIN_ROLE ? data.role : "USER";

  const existingUser = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (existingUser) {
    throw new Error("USER_EXISTS");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  await prisma.user.create({
    data: {
      name: data.name.trim(),
      email: data.email,
      password: hashedPassword,
      role,
      schoolId: data.schoolId,
    },
  });
  revalidatePath(`/dashboard/schools/${data.schoolId}/users`);
}
