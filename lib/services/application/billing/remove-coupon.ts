import { stripe } from "@/lib/infrastructure/stripe/stripe-client";
import { PrismaBillingRepository } from "@/lib/infrastructure/persistence/prisma/prisma-billing-repository";
import { BillingError, translateStripeError } from "./stripe-error";

const billingRepo = new PrismaBillingRepository();

export async function removeCoupon(schoolId: string): Promise<void> {
  const stripeCustomerId = await billingRepo.getStripeCustomerId(schoolId);

  if (!stripeCustomerId) {
    throw new BillingError("No Stripe customer found for this school", "NO_STRIPE_CUSTOMER");
  }

  const subscriptions = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    limit: 1,
    status: "all",
  });

  const subscription = subscriptions.data[0];

  if (!subscription) {
    throw new BillingError("No active subscription found for this school", "NO_SUBSCRIPTION");
  }

  try {
    await stripe.subscriptions.update(subscription.id, {
      discounts: [],
    });
  } catch (error) {
    translateStripeError(error, "COUPON_REMOVE_FAILED");
  }
}
