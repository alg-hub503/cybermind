import { stripe } from "@/lib/infrastructure/stripe/stripe-client";
import { PrismaBillingRepository } from "@/lib/infrastructure/persistence/prisma/prisma-billing-repository";
import { BillingError, translateStripeError } from "./stripe-error";
import { toRefundDto, type RefundDto, type PaginationParams, type PaginatedResult } from "./dto/billing-types";

const billingRepo = new PrismaBillingRepository();

export async function listRefunds(schoolId: string, params?: PaginationParams): Promise<PaginatedResult<RefundDto>> {
  const stripeCustomerId = await billingRepo.getStripeCustomerId(schoolId);

  if (!stripeCustomerId) {
    throw new BillingError("No Stripe customer found for this school", "NO_STRIPE_CUSTOMER");
  }

  try {
    /*
     * Stripe Refunds API does not support filtering by customer directly.
     * Workaround: fetch the customer's PaymentIntents first, then filter
     * refunds locally by matching payment_intent IDs.
     *
     * LIMITATION: If this school has >100 payment intents, only the most
     * recent 100 are scanned. For full coverage across all intents,
     * paginate through paymentIntents.list() or maintain a local mapping
     * of refund → school in the database.
     */
    const paymentIntents = await stripe.paymentIntents.list({
      customer: stripeCustomerId,
      limit: 100,
    });

    const paymentIntentIds = new Set(paymentIntents.data.map((pi) => pi.id));

    const allRefunds = await stripe.refunds.list({
      limit: params?.limit ?? 20,
      starting_after: params?.startingAfter,
      ending_before: params?.endingBefore,
    });

    const customerRefunds = allRefunds.data.filter((refund) => {
      const piId = typeof refund.payment_intent === "string"
        ? refund.payment_intent
        : refund.payment_intent?.id;
      return piId ? paymentIntentIds.has(piId) : false;
    });

    /*
     * NOTE: hasMore reflects the raw Stripe response (all refunds), not
     * the filtered customer subset. After local filtering, there may be
     * fewer results even when hasMore is true. This is acceptable for the
     * current scale; revisit if pagination accuracy becomes critical.
     */
    return {
      data: customerRefunds.map(toRefundDto),
      hasMore: allRefunds.has_more,
    };
  } catch (error) {
    translateStripeError(error, "REFUND_LIST_FAILED");
  }
}
