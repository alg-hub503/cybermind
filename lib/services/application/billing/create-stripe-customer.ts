import { PaymentGateway } from "@/lib/domain/billing/payment-gateway";

export async function createStripeCustomer(
  gateway: PaymentGateway,
  input: {
    schoolId: string;
    email: string;
    name?: string | null;
  }
): Promise<string> {
  const result = await gateway.createCustomer(input);
  return result.stripeCustomerId;
}
