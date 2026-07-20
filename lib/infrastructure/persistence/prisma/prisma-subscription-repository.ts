import { prisma } from "@/lib/prisma";
export class PrismaSubscriptionRepository {
  async findByUserId(userId: string) {
    return prisma.subscription.findUnique({
      where: {
        userId,
      },
    });
  }
  async save(
    userId: string,
    subscription: {
      stripeSubscriptionId: string;
      stripeProductId?: string | null;
      stripePriceId?: string | null;
      plan: "FREE" | "PRO";
      status:
        | "TRIALING"
        | "ACTIVE"
        | "PAST_DUE"
        | "CANCELED"
        | "UNPAID"
        | "INCOMPLETE"
        | "INCOMPLETE_EXPIRED"
        | "PAUSED";
      currentPeriodStart: Date;
      currentPeriodEnd: Date;
      cancelAtPeriodEnd: boolean;
      canceledAt?: Date | null;
    }
  ) {
    return prisma.subscription.upsert({
      where: {
        userId,
      },
      update: {
        stripeSubscriptionId: subscription.stripeSubscriptionId,
        stripeProductId: subscription.stripeProductId,
        stripePriceId: subscription.stripePriceId,
        plan: subscription.plan,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        canceledAt: subscription.canceledAt ?? null,
      },
      create: {
        stripeSubscriptionId: subscription.stripeSubscriptionId,
        stripeProductId: subscription.stripeProductId,
        stripePriceId: subscription.stripePriceId,
        plan: subscription.plan,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        canceledAt: subscription.canceledAt ?? null,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }
}
