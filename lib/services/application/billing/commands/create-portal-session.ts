import { PaymentGateway } from "@/lib/domain/billing/payment-gateway";

export async function createPortalSession(
  gateway: PaymentGateway,
  stripeCustomerId: string,
  returnUrl: string
): Promise<string> {
  if (!("createPortalSession" in gateway)) {
    throw new Error("Portal session is not supported by the payment gateway.");
  }

  const result = await (
    gateway as PaymentGateway & {
      createPortalSession(input: {
        stripeCustomerId: string;
        returnUrl: string;
      }): Promise<{
        portalUrl: string;
      }>;
    }
  ).createPortalSession({
    stripeCustomerId,
    returnUrl,
  });

  return result.portalUrl;
}
