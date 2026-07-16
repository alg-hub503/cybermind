import { Subscription } from "./subscription";

export interface SubscriptionRepository {
  getBySchoolId(schoolId: string): Promise<Subscription | null>;
  save(subscription: Subscription): Promise<void>;
}
