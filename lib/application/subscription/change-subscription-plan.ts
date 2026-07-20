export async function changeSubscriptionPlan(
  subscriptionId: string,
  plan: "FREE" | "PRO"
) {
  return {
    success: true,
    subscriptionId,
    plan,
  };
}
