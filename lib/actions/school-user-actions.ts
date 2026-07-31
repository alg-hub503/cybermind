"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

import { requireSchoolAccess } from "@/lib/authorization";
import { ADMIN_ROLE } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type CreateSchoolUserInput = {
  schoolId: string;
  name: string;
  email: string;
  password: string;
  role: "USER" | "ADMIN";
};

export async function createSchoolUser(data: CreateSchoolUserInput) {
  const { user: caller } = await requireSchoolAccess(data.schoolId);

  await createSchoolUserCore(caller, data);
  revalidatePath(`/dashboard/schools/${data.schoolId}/users`);
}

export async function createSchoolUserCore(
  caller: { role: string },
  data: CreateSchoolUserInput
) {
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

  return prisma.user.create({
    data: {
      name: data.name.trim(),
      email: data.email,
      password: hashedPassword,
      role,
      schoolId: data.schoolId,
    },
  });
}
