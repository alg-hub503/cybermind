import { createSubscriptionService } from "@/lib/infrastructure/subscription/subscription-factory";

export async function updateSubscription() {
  const service = createSubscriptionService();

  return service.client;
}
