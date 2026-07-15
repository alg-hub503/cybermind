import { prisma } from "@/lib/prisma";

export async function getInvoiceCountBySchool(schoolId: string) {
  return prisma.invoice.count({
    where: {
      schoolId,
    },
  });
}

export async function getRevenueBySchool(schoolId: string) {
  const revenue = await prisma.invoice.aggregate({
    where: {
      schoolId,
    },
    _sum: {
      amount: true,
    },
  });

  return revenue._sum.amount ?? 0;
}

export async function getLatestInvoicesBySchool(
  schoolId: string,
  limit = 5
) {
  return prisma.invoice.findMany({
    where: {
      schoolId,
    },
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      Client: true,
    },
  });
}
