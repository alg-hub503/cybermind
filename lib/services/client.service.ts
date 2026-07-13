import { prisma } from "@/lib/prisma";

export async function getClients(
  schoolId?: string,
  search?: string
) {
  return prisma.client.findMany({
    where: {
      ...(schoolId ? { schoolId } : {}),

      ...(search
        ? {
            name: {
              contains: search,
              mode: "insensitive",
            },
          }
        : {}),
    },

    orderBy: {
      name: "asc",
    },
  });
}

export async function getClientById(
  id: string,
  schoolId?: string
) {
  return prisma.client.findFirst({
    where: {
      id,
      ...(schoolId ? { schoolId } : {}),
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

export async function deleteClient(
  id: string,
  schoolId?: string
) {
  const client = await prisma.client.findFirst({
    where: {
      id,
      ...(schoolId ? { schoolId } : {}),
    },
  });

  if (!client) {
    throw new Error("Client not found");
  }

  return prisma.client.delete({
    where: {
      id,
    },
  });
}