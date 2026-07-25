import { stripe } from "@/lib/infrastructure/stripe/stripe-client";
import { prisma } from "@/lib/prisma";
import { BillingError, translateStripeError } from "./stripe-error";

export async function cancelSubscription(schoolId: string): Promise<void> {
  const subscription = await prisma.subscription.findUnique({
    where: { schoolId },
  });

  if (!subscription) {
    throw new BillingError("No subscription found for this school", "NO_SUBSCRIPTION");
  }

  if (!subscription.stripeSubscriptionId) {
    throw new BillingError("Subscription has no Stripe reference", "NO_STRIPE_SUBSCRIPTION");
  }

  try {
    await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
  } catch (error) {
    translateStripeError(error, "CANCEL_SUBSCRIPTION_FAILED");
  }
}
