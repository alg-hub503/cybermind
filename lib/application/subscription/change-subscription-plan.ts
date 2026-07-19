import { createSubscriptionService } from "@/lib/infrastructure/subscription/subscription-factory";

export async function changeSubscriptionPlan(
  subscriptionId: string,
  priceId: string
) {
  const stripe = createSubscriptionService().client;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  return stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: priceId,
      },
    ],
  });
}
