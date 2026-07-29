import { prisma } from "@/lib/prisma";

export async function getUsers(search?: string) {
  return prisma.user.findMany({
    where: search
      ? {
          OR: [
            {
              email: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        }
      : undefined,

    orderBy: {
      email: "asc",
    },
    include: {
      School: {
        select: {
          subscription: true,
        },
      },
    },
  });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: {
      id,
    },
  });
}

export async function updateUserRole(
  id: string,
  role: string
) {
  return prisma.user.update({
    where: {
      id,
    },
    data: {
      role,
    },
  });
}

