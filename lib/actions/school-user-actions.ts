"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

import { MIN_PASSWORD_LENGTH, normalizeEmail } from "@/lib/auth-input";
import { requireAdmin } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { findUserByLoginEmail } from "@/lib/services/domain/user.service";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type CreateSchoolUserInput = {
  schoolId: string;
  name: string;
  email: string;
  password: string;
  role: "USER" | "ADMIN";
};

export async function createSchoolUser(data: CreateSchoolUserInput) {
  await requireAdmin();

  await createSchoolUserCore(data);
  revalidatePath(`/dashboard/schools/${data.schoolId}/users`);
}

export async function createSchoolUserCore(data: CreateSchoolUserInput) {
  if (!data.schoolId || !data.name?.trim()) {
    throw new Error("INVALID_INPUT");
  }

  const email = normalizeEmail(data.email);

  if (!EMAIL_PATTERN.test(email)) {
    throw new Error("INVALID_INPUT");
  }

  if (!data.password || data.password.length < MIN_PASSWORD_LENGTH) {
    throw new Error("INVALID_INPUT");
  }

  const existingUser = await findUserByLoginEmail(email);

  if (existingUser) {
    throw new Error("USER_EXISTS");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  return prisma.user.create({
    data: {
      name: data.name.trim(),
      email,
      password: hashedPassword,
      role: data.role,
      schoolId: data.schoolId,
    },
  });
}
