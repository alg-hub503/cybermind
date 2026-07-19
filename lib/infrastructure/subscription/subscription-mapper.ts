import Stripe from "stripe";

export interface SubscriptionDto {
  id: string;
  status: string;
  customerId: string | null;
}

export function mapStripeSubscription(
  subscription: Stripe.Subscription
): SubscriptionDto {
  return {
    id: subscription.id,
    status: subscription.status,
    customerId:
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer?.id ?? null,
  };
}
