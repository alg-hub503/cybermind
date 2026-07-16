import { PaymentGateway } from "@/lib/domain/billing/payment-gateway";
import { CreateCheckoutSessionResult } from "@/lib/services/application/billing/dto/create-checkout-session-result";
import { CreateCustomerInput } from "@/lib/services/application/billing/dto/create-customer-input";
import { CreateCustomerResult } from "@/lib/services/application/billing/dto/create-customer-result";
import { stripe } from "./stripe-client";

export class StripeGateway implements PaymentGateway {
  async createCustomer(
    input: CreateCustomerInput
  ): Promise<CreateCustomerResult> {
    try {
      const customer = await stripe.customers.create(
        {
          email: input.email,
          name: input.name ?? undefined,
          metadata: {
            schoolId: input.schoolId,
          },
        },
        {
          idempotencyKey: `create-customer:${input.schoolId}`,
        }
      );

      return {
        stripeCustomerId: customer.id,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Unable to create Stripe customer: ${error.message}`);
      }

      throw new Error("Unable to create Stripe customer.");
    }
  }

  async createCheckoutSession(
    customerId: string,
    priceId: string,
    schoolId: string
  ): Promise<CreateCheckoutSessionResult> {
    throw new Error("Not implemented");
  }
}
