import { stripe } from "@/lib/infrastructure/stripe/stripe-client";
import { BillingError, translateStripeError } from "./stripe-error";

export async function downloadInvoice(stripeInvoiceId: string): Promise<string> {
  let invoice;
  try {
    invoice = await stripe.invoices.retrieve(stripeInvoiceId);
  } catch (error) {
    translateStripeError(error, "INVOICE_NOT_FOUND");
  }

  if (!invoice.invoice_pdf) {
    throw new BillingError("Invoice PDF not available", "INVOICE_PDF_NOT_AVAILABLE");
  }

  return invoice.invoice_pdf;
}
