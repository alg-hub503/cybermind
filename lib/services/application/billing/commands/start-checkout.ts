import { PaymentGateway } from "@/lib/domain/billing/payment-gateway";
import { createCheckoutSession } from "../create-checkout-session";
import { getOrCreateStripeCustomer } from "../get-or-create-stripe-customer";

export async function startCheckout(
  gateway: PaymentGateway,
  input: {
    schoolId: string;
    email: string;
    name?: string | null;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
  }
): Promise<string> {
  const stripeCustomerId = await getOrCreateStripeCustomer(
    gateway,
    input.schoolId,
    input.email,
    input.name
  );

  const session = await createCheckoutSession(gateway, {
    stripeCustomerId,
    schoolId: input.schoolId,
    priceId: input.priceId,
    successUrl: input.successUrl,
    cancelUrl: input.cancelUrl,
  });

  return session.checkoutUrl;
}
