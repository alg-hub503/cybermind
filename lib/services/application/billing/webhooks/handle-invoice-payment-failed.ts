import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { SubscriptionStatus } from "@prisma/client";

export async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const rawSubscription = invoice.parent?.subscription_details?.subscription;

  if (!rawSubscription) {
    console.log("No subscription attached to failed invoice");
    return;
  }

  const subscriptionId = typeof rawSubscription === "string" ? rawSubscription : rawSubscription.id;

  const existing = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!existing) {
    console.log(`Subscription not found for stripeSubscriptionId: ${subscriptionId}`);
    return;
  }

  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscriptionId },
    data: {
      status: SubscriptionStatus.PAST_DUE,
    },
  });
}
