"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

export async function createSchoolUser(data: {
  schoolId: string;
  name: string;
  email: string;
  password: string;
  role: "USER" | "ADMIN";
}) {
  const existingUser =
    await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

  if (existingUser) {
    throw new Error("USER_EXISTS");
  }

  const hashedPassword =
    await bcrypt.hash(data.password, 10);

  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      schoolId: data.schoolId,
      subscriptionStatus: "TRIAL",
    },
  });

  revalidatePath(
    `/dashboard/schools/${data.schoolId}/users`
  );
}
