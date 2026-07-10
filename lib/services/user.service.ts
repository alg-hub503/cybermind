import { prisma } from "@/lib/prisma";

export async function getUsers() {
  return prisma.user.findMany({
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
  return prisma.user.delete({
    where: {
      id,
    },
  });
}