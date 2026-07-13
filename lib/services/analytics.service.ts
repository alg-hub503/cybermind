import { prisma } from "@/lib/prisma";

export async function getDashboardAnalytics() {
  const [
    totalUsers,
    totalClients,
    totalSchools,
    totalInvoices,
    revenueResult,
    averageInvoiceResult,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.client.count(),
    prisma.school.count(),
    prisma.invoice.count(),

    prisma.invoice.aggregate({
      _sum: {
        amount: true,
      },
    }),

    prisma.invoice.aggregate({
      _avg: {
        amount: true,
      },
    }),
  ]);

  return {
    totalUsers,
    totalClients,
    totalSchools,
    totalInvoices,

    totalRevenue:
      revenueResult._sum.amount ?? 0,

    averageInvoice:
      averageInvoiceResult._avg.amount ?? 0,
  };
}

export async function getRevenueTrend() {
  const invoices = await prisma.invoice.findMany({
    select: {
      amount: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const monthlyRevenue = new Map<string, number>();

  for (const invoice of invoices) {
    const month = invoice.createdAt.toLocaleString("en-US", {
      month: "short",
    });

    monthlyRevenue.set(
      month,
      (monthlyRevenue.get(month) ?? 0) + invoice.amount
    );
  }

  return Array.from(monthlyRevenue.entries()).map(
    ([month, revenue]) => ({
      month,
      revenue,
    })
  );
}
export async function getTopClients(limit = 5) {
  const clients = await prisma.client.findMany({
    include: {
      Invoice: true,
    },
  });

  return clients
    .map((client) => ({
      id: client.id,
      name: client.name,
      revenue: client.Invoice.reduce(
        (total, invoice) => total + invoice.amount,
        0
      ),
      invoices: client.Invoice.length,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}
export async function getLatestInvoices(limit = 5) {
  return prisma.invoice.findMany({
    take: limit,

    orderBy: {
      createdAt: "desc",
    },

    include: {
      Client: true,
    },
  });
}
