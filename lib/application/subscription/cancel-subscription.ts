export async function cancelSubscription(subscriptionId: string) {
  return {
    success: true,
    subscriptionId,
  };
}
