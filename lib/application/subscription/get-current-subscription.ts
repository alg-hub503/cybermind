import { createSubscriptionService } from "@/lib/infrastructure/subscription/subscription-factory";

export async function getCurrentSubscription(subscriptionId: string) {
  const stripe = createSubscriptionService().client;

  return stripe.subscriptions.retrieve(subscriptionId);
}
