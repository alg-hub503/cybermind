import { prisma } from "@/lib/prisma";

export async function getAdminStats() {
  const [users, clients, schools, invoices] =
    await Promise.all([
      prisma.user.count(),
      prisma.client.count(),
      prisma.school.count(),
      prisma.invoice.count(),
    ]);

  return {
    users,
    clients,
    schools,
    invoices,
  };
}

export async function getSchoolStats(
  schoolId: string
) {
  const [
    clients,
    users,
    invoices,
    revenueResult,
  ] = await Promise.all([
    prisma.client.count({
      where: {
        schoolId,
      },
    }),

    prisma.user.count({
      where: {
        schoolId,
      },
    }),

    prisma.invoice.count({
      where: {
        schoolId,
      },
    }),

    prisma.invoice.aggregate({
      where: {
        schoolId,
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  return {
    clients,
    users,
    invoices,
    revenue:
      revenueResult._sum.amount ?? 0,
  };
}