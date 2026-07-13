"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

export async function updateUser(data: {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
}) {
  await prisma.user.update({
    where: {
      id: data.id,
    },
    data: {
      name: data.name,
      email: data.email,
      role: data.role,
    },
  });

  revalidatePath("/dashboard/users");

  redirect("/dashboard/users");
}
