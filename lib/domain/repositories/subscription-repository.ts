import type { Subscription } from "../entities/subscription";

export interface SubscriptionRepository {
  findById(id: string): Promise<Subscription | null>;
}
