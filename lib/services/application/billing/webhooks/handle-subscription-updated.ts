import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { normalizeSubscriptionStatus } from "./normalize-subscription-status";

export async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  const existing = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!existing) {
    console.log(`Subscription not found for stripeSubscriptionId: ${subscription.id}`);
    return;
  }

  const item = subscription.items.data[0];
  const price = item?.price;
  const stripePriceId = price?.id ?? null;
  const stripeProductId = price?.product ? (typeof price.product === "string" ? price.product : price.product.id) : null;

  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: normalizeSubscriptionStatus(subscription.status),
      currentPeriodStart: new Date((item?.current_period_start ?? 0) * 1000),
      currentPeriodEnd: new Date((item?.current_period_end ?? 0) * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      stripePriceId,
      stripeProductId,
    },
  });
}
