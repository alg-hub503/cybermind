import Stripe from "stripe";

export class StripeSubscriptionService {
  private readonly stripe: Stripe;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      throw new Error("Missing STRIPE_SECRET_KEY");
    }

    this.stripe = new Stripe(secretKey);
  }

  get client(): Stripe {
    return this.stripe;
  }
}