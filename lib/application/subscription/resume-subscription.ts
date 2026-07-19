import { createSubscriptionService } from "@/lib/infrastructure/subscription/subscription-factory";

export async function resumeSubscription(subscriptionId: string) {
  const stripe = createSubscriptionService().client;

  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}
