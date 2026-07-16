import { CreateCheckoutSessionResult } from "@/lib/services/application/billing/dto/create-checkout-session-result";

export interface PaymentGateway {
  createCheckoutSession(
    customerId: string,
    priceId: string,
    schoolId: string
  ): Promise<CreateCheckoutSessionResult>;
}
