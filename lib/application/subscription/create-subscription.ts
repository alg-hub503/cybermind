import { createSubscriptionService } from "@/lib/infrastructure/subscription/subscription-factory";

export async function createSubscription(
  customerId: string,
  priceId: string
) {
  const stripe = createSubscriptionService().client;

  return stripe.subscriptions.create({
    customer: customerId,
    items: [
      {
        price: priceId,
      },
    ],
  });
}
