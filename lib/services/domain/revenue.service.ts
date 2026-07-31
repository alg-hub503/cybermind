import { prisma } from "@/lib/prisma";

export async function getTotalRevenue(schoolId?: string) {
  const result = await prisma.invoice.aggregate({
    _sum: {
      amount: true,
    },
    where: schoolId ? { schoolId } : undefined,
  });

  return result._sum.amount ?? 0;
}

export async function getAverageInvoice(schoolId?: string) {
  const result = await prisma.invoice.aggregate({
    _avg: {
      amount: true,
    },
    where: schoolId ? { schoolId } : undefined,
  });

  return result._avg.amount ?? 0;
}
