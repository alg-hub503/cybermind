import { Subscription } from "@/lib/domain/billing/subscription";

export async function getCurrentSubscription(
  schoolId: string
): Promise<Subscription | null> {
  throw new Error("Not implemented");
}
