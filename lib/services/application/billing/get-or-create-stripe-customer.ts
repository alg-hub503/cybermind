import { PaymentGateway } from "@/lib/domain/billing/payment-gateway";
import { createStripeCustomer } from "./create-stripe-customer";

export async function getOrCreateStripeCustomer(
  gateway: PaymentGateway,
  schoolId: string,
  email: string,
  name?: string | null
): Promise<string> {
  return createStripeCustomer(gateway, {
    schoolId,
    email,
    name,
  });
}
