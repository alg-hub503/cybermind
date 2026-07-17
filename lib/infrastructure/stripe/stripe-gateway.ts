import { stripe } from "./stripe-client";
import { CreateCheckoutSessionInput } from "@/lib/services/application/billing/dto/create-checkout-session-input";
import { CreateCheckoutSessionResult } from "@/lib/services/application/billing/dto/create-checkout-session-result";
import { PaymentGateway } from "@/lib/domain/billing/payment-gateway";

export class StripeGateway implements PaymentGateway {
  async createCustomer(input: {
    schoolId: string;
    email: string;
    name?: string | null;
  }): Promise<{
    stripeCustomerId: string;
  }> {
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
  }

  async createCheckoutSession(
    input: CreateCheckoutSessionInput
  ): Promise<CreateCheckoutSessionResult> {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: input.stripeCustomerId,
      line_items: [
        {
          price: input.priceId,
          quantity: 1,
        },
      ],
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      metadata: {
        schoolId: input.schoolId,
      },
    });

    return {
      checkoutUrl: session.url!,
      sessionId: session.id,
    };
  }

  async createPortalSession(input: {
    stripeCustomerId: string;
    returnUrl: string;
  }): Promise<{
    portalUrl: string;
  }> {
    const session = await stripe.billingPortal.sessions.create({
      customer: input.stripeCustomerId,
      return_url: input.returnUrl,
    });

    return {
      portalUrl: session.url,
    };
  }
}
