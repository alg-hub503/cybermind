import { CreateCheckoutSessionInput } from "@/lib/services/application/billing/dto/create-checkout-session-input";
import { CreateCheckoutSessionResult } from "@/lib/services/application/billing/dto/create-checkout-session-result";

export interface PaymentGateway {
  createCheckoutSession(
    input: CreateCheckoutSessionInput
  ): Promise<CreateCheckoutSessionResult>;

  createCustomer(input: {
    schoolId: string;
    email: string;
    name?: string | null;
  }): Promise<{
    stripeCustomerId: string;
  }>;
}