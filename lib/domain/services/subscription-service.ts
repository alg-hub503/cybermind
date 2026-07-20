export interface SubscriptionService {
  getCurrentSubscription(userId: string): Promise<unknown>;
}
