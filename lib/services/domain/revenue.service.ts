import { prisma } from "@/lib/prisma";

export async function getTotalRevenue() {
  const result = await prisma.invoice.aggregate({
    _sum: {
      amount: true,
    },
  });

  return result._sum.amount ?? 0;
}

export async function getAverageInvoice() {
  const result = await prisma.invoice.aggregate({
    _avg: {
      amount: true,
    },
  });

  return result._avg.amount ?? 0;
}