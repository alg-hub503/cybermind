import { stripe } from "@/lib/infrastructure/stripe/stripe-client";
import { BillingError, translateStripeError } from "./stripe-error";
import { toRefundDto, type RefundDto } from "./dto/billing-types";

export async function refundPayment(paymentIntentId: string, amount?: number): Promise<RefundDto> {
  let paymentIntent;
  try {
    paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (error) {
    translateStripeError(error, "PAYMENT_NOT_FOUND");
  }

  if (paymentIntent.status !== "succeeded") {
    throw new BillingError("Payment has not succeeded and cannot be refunded", "PAYMENT_NOT_SUCCEEDED");
  }

  const idempotencyKey = `refund-payment:${paymentIntentId}:${amount ?? "full"}`;

  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    }, { idempotencyKey });

    return toRefundDto(refund);
  } catch (error) {
    translateStripeError(error, "REFUND_FAILED");
  }
}
