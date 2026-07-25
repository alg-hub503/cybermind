import { stripe } from "@/lib/infrastructure/stripe/stripe-client";
import { PrismaBillingRepository } from "@/lib/infrastructure/persistence/prisma/prisma-billing-repository";
import { BillingError, translateStripeError } from "./stripe-error";

const billingRepo = new PrismaBillingRepository();

export async function applyCoupon(schoolId: string, couponId: string): Promise<void> {
  const stripeCustomerId = await billingRepo.getStripeCustomerId(schoolId);

  if (!stripeCustomerId) {
    throw new BillingError("No Stripe customer found for this school", "NO_STRIPE_CUSTOMER");
  }

  let coupon;
  try {
    coupon = await stripe.coupons.retrieve(couponId);
  } catch (error) {
    translateStripeError(error, "COUPON_INVALID");
  }

  if (!coupon.valid) {
    throw new BillingError("Coupon is no longer valid", "COUPON_EXPIRED");
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

  const idempotencyKey = `apply-coupon:${schoolId}:${couponId}`;

  try {
    await stripe.subscriptions.update(subscription.id, {
      discounts: [{ coupon: couponId }],
    }, { idempotencyKey });
  } catch (error) {
    translateStripeError(error, "COUPON_APPLY_FAILED");
  }
}
