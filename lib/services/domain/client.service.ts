import { prisma } from "@/lib/prisma";

export async function getClientCountBySchool(schoolId: string) {
  return prisma.client.count({
    where: {
      schoolId,
    },
  });
}

export async function getClientsBySchool(schoolId: string) {
  return prisma.client.findMany({
    where: {
      schoolId,
    },
  });
}

export async function getClientsForSelect(schoolId?: string) {
  return prisma.client.findMany({
    where: schoolId
      ? {
          schoolId,
        }
      : undefined,

    orderBy: {
      name: "asc",
    },

    select: {
      id: true,
      name: true,
    },
  });
}
