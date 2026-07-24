import { PaymentGateway } from "@/lib/domain/billing/payment-gateway";
import { PrismaBillingRepository } from "@/lib/infrastructure/persistence/prisma/prisma-billing-repository";
import { createStripeCustomer } from "./create-stripe-customer";

const billingRepo = new PrismaBillingRepository();

export async function getOrCreateStripeCustomer(
  gateway: PaymentGateway,
  schoolId: string,
  email: string,
  name?: string | null
): Promise<string> {
  const existingId = await billingRepo.getStripeCustomerId(schoolId);

  if (existingId) {
    return existingId;
  }

  const stripeCustomerId = await createStripeCustomer(gateway, {
    schoolId,
    email,
    name,
  });

  await billingRepo.saveStripeCustomerId(schoolId, stripeCustomerId);

  return stripeCustomerId;
}
