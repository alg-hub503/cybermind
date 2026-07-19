import { createSubscription } from "@/lib/application/subscription/create-subscription";

export async function POST() {
  await createSubscription();

  return Response.json({
    success: true,
  });
}
