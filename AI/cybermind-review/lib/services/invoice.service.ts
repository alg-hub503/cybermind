import { prisma } from "@/lib/prisma";

export async function getInvoices(schoolId?: string) {
  return prisma.invoice.findMany({
    where: schoolId
      ? {
          schoolId,
        }
      : undefined,
    include: {
      Client: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getInvoiceById(id: string) {
  return prisma.invoice.findUnique({
    where: {
      id,
    },
    include: {
      Client: true,
    },
  });
}

export async function createInvoice(data: {
  id: string;
  amount: number;
  clientId: string;
  schoolId: string;
}) {
  return prisma.invoice.create({
    data,
  });
}

export async function deleteInvoice(id: string) {
  return prisma.invoice.delete({
    where: {
      id,
    },
  });
}