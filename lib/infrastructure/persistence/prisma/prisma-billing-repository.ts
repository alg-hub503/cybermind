import { prisma } from "@/lib/prisma";

export class PrismaBillingRepository {
  async getStripeCustomerId(
    schoolId: string
  ): Promise<string | null> {
    const school = await prisma.school.findUnique({
      where: {
        id: schoolId,
      },
      select: {
        stripeCustomerId: true,
      },
    });

    return school?.stripeCustomerId ?? null;
  }

  async saveStripeCustomerId(
    schoolId: string,
    stripeCustomerId: string
  ): Promise<void> {
    await prisma.school.update({
      where: {
        id: schoolId,
      },
      data: {
        stripeCustomerId,
      },
    });
  }
}
