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

export async function updateSubscription(
  id: string,
  subscriptionStatus: string
) {
  return prisma.user.update({
    where: {
      id,
    },
    data: {
      subscriptionStatus,
    },
  });
}

export async function deleteUser(id: string) {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role === "ADMIN") {
    const admins = await prisma.user.count({
      where: {
        role: "ADMIN",
      },
    });

    if (admins <= 1) {
      throw new Error("Cannot delete the last admin");
    }
  }

  return prisma.user.delete({
    where: {
      id,
    },
  });
}
