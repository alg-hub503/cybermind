import { stripe } from "@/lib/infrastructure/stripe/stripe-client";
import { BillingError, translateStripeError } from "./stripe-error";

export async function generateReceipt(stripeInvoiceId: string): Promise<string> {
  let invoice;
  try {
    invoice = await stripe.invoices.retrieve(stripeInvoiceId);
  } catch (error) {
    translateStripeError(error, "INVOICE_NOT_FOUND");
  }

  if (invoice.status !== "paid") {
    throw new BillingError("Invoice has not been paid yet", "INVOICE_NOT_PAID");
  }

  if (!invoice.hosted_invoice_url) {
    throw new BillingError("Receipt URL is not available for this invoice", "RECEIPT_NOT_AVAILABLE");
  }

  return invoice.hosted_invoice_url;
}
