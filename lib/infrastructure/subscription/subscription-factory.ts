import { StripeSubscriptionService } from "./stripe-subscription-service";

export function createSubscriptionService() {
  return new StripeSubscriptionService();
}
