import { PaymentGateway } from "@/lib/domain/billing/payment-gateway";
import { CreateCheckoutSessionResult } from "@/lib/services/application/billing/dto/create-checkout-session-result";

export class StripeGateway implements PaymentGateway {
  async createCheckoutSession(
    customerId: string,
    priceId: string,
    schoolId: string
  ): Promise<CreateCheckoutSessionResult> {
    throw new Error("Not implemented");
  }
}
