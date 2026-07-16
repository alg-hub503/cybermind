import { PaymentGateway } from "@/lib/domain/billing/payment-gateway";
import { CreateCheckoutSessionInput } from "./dto/create-checkout-session-input";
import { CreateCheckoutSessionResult } from "./dto/create-checkout-session-result";

export async function createCheckoutSession(
  gateway: PaymentGateway,
  input: CreateCheckoutSessionInput
): Promise<CreateCheckoutSessionResult> {
  return gateway.createCheckoutSession(input);
}