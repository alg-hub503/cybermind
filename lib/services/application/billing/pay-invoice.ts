import { stripe } from "@/lib/infrastructure/stripe/stripe-client";
import { BillingError, translateStripeError } from "./stripe-error";
import { toInvoiceDto, type InvoiceDto } from "./dto/billing-types";

export async function payInvoice(stripeInvoiceId: string): Promise<InvoiceDto> {
  let invoice;
  try {
    invoice = await stripe.invoices.retrieve(stripeInvoiceId);
  } catch (error) {
    translateStripeError(error, "INVOICE_NOT_FOUND");
  }

  if (invoice.status === "paid") {
    throw new BillingError("Invoice is already paid", "INVOICE_ALREADY_PAID");
  }

  const idempotencyKey = `pay-invoice:${stripeInvoiceId}`;

  try {
    const paid = await stripe.invoices.pay(stripeInvoiceId, undefined, { idempotencyKey });
    return toInvoiceDto(paid);
  } catch (error) {
    translateStripeError(error, "INVOICE_PAYMENT_FAILED");
  }
}
