import { createSubscriptionService } from "@/lib/infrastructure/subscription/subscription-factory";

export async function createSubscription() {
  const service = createSubscriptionService();

  return service.client;
}
