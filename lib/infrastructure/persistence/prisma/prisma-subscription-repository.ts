import { Subscription } from "@/lib/domain/billing/subscription";
import { SubscriptionRepository } from "@/lib/domain/billing/subscription-repository";

export class PrismaSubscriptionRepository implements SubscriptionRepository {
  async getBySchoolId(
    schoolId: string
  ): Promise<Subscription | null> {
    throw new Error("Not implemented");
  }

  async save(
    subscription: Subscription
  ): Promise<void> {
    throw new Error("Not implemented");
  }
}
