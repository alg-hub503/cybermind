export interface CreateCheckoutSessionInput {
  stripeCustomerId: string;
  priceId: string;
  schoolId: string;
  successUrl: string;
  cancelUrl: string;
}