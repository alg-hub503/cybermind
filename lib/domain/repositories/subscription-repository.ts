export interface SubscriptionRepository {
  findByUserId(userId: string): Promise<unknown>;
}
