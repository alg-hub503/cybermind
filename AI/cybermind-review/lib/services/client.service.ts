import { prisma } from "@/lib/prisma";

export async function getClients(schoolId?: string) {
  return prisma.client.findMany({
    where: schoolId
      ? {
          schoolId,
        }
      : undefined,
    orderBy: {
      name: "asc",
    },
  });
}

export async function getClientById(id: string) {
  return prisma.client.findUnique({
    where: {
      id,
    },
  });
}

export async function createClient(data: {
  name: string;
  schoolId: string;
}) {
  return prisma.client.create({
    data,
  });
}

export async function updateClient(
  id: string,
  data: {
    name: string;
  }
) {
  return prisma.client.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteClient(id: string) {
  return prisma.client.delete({
    where: {
      id,
    },
  });
}