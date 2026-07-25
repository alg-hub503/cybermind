import { StripeGateway } from "@/lib/infrastructure/stripe/stripe-gateway";
import { PrismaBillingRepository } from "@/lib/infrastructure/persistence/prisma/prisma-billing-repository";
import { createPortalSession as createPortalSessionCommand } from "@/lib/services/application/billing/commands/create-portal-session";
import { BillingError } from "./stripe-error";

const billingRepo = new PrismaBillingRepository();

export async function createPortalSession(schoolId: string, returnUrl: string): Promise<string> {
  const stripeCustomerId = await billingRepo.getStripeCustomerId(schoolId);

  if (!stripeCustomerId) {
    throw new BillingError("No Stripe customer found for this school", "NO_STRIPE_CUSTOMER");
  }

  const gateway = new StripeGateway();

  return createPortalSessionCommand(gateway, stripeCustomerId, returnUrl);
}
