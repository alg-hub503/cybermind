import { CreateCheckoutSessionInput } from "@/lib/services/application/billing/dto/create-checkout-session-input";
import { CreateCheckoutSessionResult } from "@/lib/services/application/billing/dto/create-checkout-session-result";

export class StripeGateway {
  async createCheckoutSession(
    input: CreateCheckoutSessionInput
  ): Promise<CreateCheckoutSessionResult> {
    throw new Error("Not implemented");
  }
}