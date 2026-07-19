import { Subscription } from "../entities/subscription";

export interface SubscriptionRepository {
  findBySchoolId(schoolId: string): Promise<Subscription | null>;

  create(subscription: Subscription): Promise<Subscription>;

  update(subscription: Subscription): Promise<Subscription>;

  cancel(schoolId: string): Promise<void>;

  resume(schoolId: string): Promise<void>;

  changePlan(schoolId: string, plan: string): Promise<void>;
}
