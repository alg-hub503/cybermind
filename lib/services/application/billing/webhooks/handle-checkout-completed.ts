import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/infrastructure/stripe/stripe-client";
import { SubscriptionPlan } from "@prisma/client";
import { normalizeSubscriptionStatus } from "./normalize-subscription-status";

export async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const schoolId = session.metadata?.schoolId ?? session.client_reference_id;

  if (!schoolId) {
    console.log("Missing schoolId in checkout.session.completed — metadata.schoolId and client_reference_id are both empty");
    return;
  }

  const school = await prisma.school.findUnique({ where: { id: schoolId } });

  if (!school) {
    console.log(`School not found for schoolId: ${schoolId}`);
    return;
  }

  const stripeSubscriptionId = session.subscription;

  if (!stripeSubscriptionId) {
    console.log("No subscription attached to checkout session");
    return;
  }

  const subscriptionId = typeof stripeSubscriptionId === "string" ? stripeSubscriptionId : stripeSubscriptionId.id;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const status = normalizeSubscriptionStatus(subscription.status);
  const item = subscription.items.data[0];
  const price = item?.price;
  const stripePriceId = price?.id ?? null;
  const stripeProductId = price?.product ? (typeof price.product === "string" ? price.product : price.product.id) : null;
  const stripeCustomerId = session.customer ? (typeof session.customer === "string" ? session.customer : session.customer.id) : null;

  await prisma.$transaction(async (tx) => {
    if (stripeCustomerId) {
      await tx.school.update({
        where: { id: schoolId },
        data: { stripeCustomerId },
      });
    }

    await tx.subscription.upsert({
      where: { schoolId },
      create: {
        schoolId,
        stripeSubscriptionId: subscriptionId,
        stripePriceId,
        stripeProductId,
        plan: SubscriptionPlan.PRO,
        status,
        currentPeriodStart: new Date((item?.current_period_start ?? 0) * 1000),
        currentPeriodEnd: new Date((item?.current_period_end ?? 0) * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
      update: {
        stripeSubscriptionId: subscriptionId,
        stripePriceId,
        stripeProductId,
        plan: SubscriptionPlan.PRO,
        status,
        currentPeriodStart: new Date((item?.current_period_start ?? 0) * 1000),
        currentPeriodEnd: new Date((item?.current_period_end ?? 0) * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    });
  });
}
