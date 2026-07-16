import { PaymentGateway } from "@/lib/domain/billing/payment-gateway";

export async function getOrCreateStripeCustomer(
  gateway: PaymentGateway,
  schoolId: string
): Promise<string> {
  throw new Error("Not implemented");
}
