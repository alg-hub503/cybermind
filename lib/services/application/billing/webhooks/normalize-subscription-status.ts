import { SubscriptionStatus } from "@prisma/client";

export function normalizeSubscriptionStatus(status: string): SubscriptionStatus {
  const mapping: Record<string, SubscriptionStatus> = {
    trialing: SubscriptionStatus.TRIALING,
    active: SubscriptionStatus.ACTIVE,
    past_due: SubscriptionStatus.PAST_DUE,
    canceled: SubscriptionStatus.CANCELED,
    unpaid: SubscriptionStatus.UNPAID,
    incomplete: SubscriptionStatus.INCOMPLETE,
    incomplete_expired: SubscriptionStatus.INCOMPLETE_EXPIRED,
    paused: SubscriptionStatus.PAUSED,
  };
  return mapping[status] ?? SubscriptionStatus.ACTIVE;
}
