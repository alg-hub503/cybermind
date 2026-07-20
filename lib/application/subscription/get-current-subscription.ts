import { PrismaSubscriptionRepository } from "@/lib/infrastructure/persistence/prisma/prisma-subscription-repository";

export async function getCurrentSubscription(userId: string) {
  const repository = new PrismaSubscriptionRepository();

  return repository.findByUserId(userId);
}
