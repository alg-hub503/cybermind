import { stripe } from "@/lib/infrastructure/stripe/stripe-client";
import { PrismaBillingRepository } from "@/lib/infrastructure/persistence/prisma/prisma-billing-repository";
import { BillingError, translateStripeError } from "./stripe-error";
import { toPaymentDto, type PaymentDto, type PaginationParams, type PaginatedResult } from "./dto/billing-types";

const billingRepo = new PrismaBillingRepository();

export async function listPayments(schoolId: string, params?: PaginationParams): Promise<PaginatedResult<PaymentDto>> {
  const stripeCustomerId = await billingRepo.getStripeCustomerId(schoolId);

  if (!stripeCustomerId) {
    throw new BillingError("No Stripe customer found for this school", "NO_STRIPE_CUSTOMER");
  }

  try {
    const result = await stripe.paymentIntents.list({
      customer: stripeCustomerId,
      limit: params?.limit ?? 20,
      starting_after: params?.startingAfter,
      ending_before: params?.endingBefore,
    });

    return {
      data: result.data.map(toPaymentDto),
      hasMore: result.has_more,
    };
  } catch (error) {
    translateStripeError(error, "PAYMENT_LIST_FAILED");
  }
}
