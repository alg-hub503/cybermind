export interface Subscription {
  id: string;

  schoolId: string;

  stripeCustomerId: string | null;

  stripeSubscriptionId: string | null;

  plan: string;

  status: string;

  currentPeriodStart: Date | null;

  currentPeriodEnd: Date | null;

  cancelAtPeriodEnd: boolean;

  createdAt: Date;

  updatedAt: Date;
}
