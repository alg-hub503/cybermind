import { PrismaBillingRepository } from "@/lib/infrastructure/persistence/prisma/prisma-billing-repository";
import { prisma } from "@/lib/prisma";
import { BillingError } from "./stripe-error";

const billingRepo = new PrismaBillingRepository();

interface BillingStatusResult {
  hasStripeCustomer: boolean;
  subscriptionStatus: string | null;
  subscriptionPlan: string | null;
  currentPeriodEnd: number | null;
  cancelAtPeriodEnd: boolean;
}

export async function getBillingStatus(schoolId: string): Promise<BillingStatusResult> {
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    include: { subscription: true },
  });

  if (!school) {
    throw new BillingError("School not found", "SCHOOL_NOT_FOUND");
  }

  return {
    hasStripeCustomer: !!school.stripeCustomerId,
    subscriptionStatus: school.subscription?.status ?? null,
    subscriptionPlan: school.subscription?.plan ?? null,
    currentPeriodEnd: school.subscription?.currentPeriodEnd?.getTime() ?? null,
    cancelAtPeriodEnd: school.subscription?.cancelAtPeriodEnd ?? false,
  };
}
