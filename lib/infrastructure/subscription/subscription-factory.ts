import Stripe from "stripe";

export function createSubscriptionService() {
  return {
    client: new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-05-27.dahlia",
    }),
  };
}
