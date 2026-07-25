import { stripe } from "@/lib/infrastructure/stripe/stripe-client";
import { BillingError, translateStripeError } from "./stripe-error";
import { toInvoiceDto, type InvoiceDto } from "./dto/billing-types";

export async function getInvoice(stripeInvoiceId: string): Promise<InvoiceDto> {
  try {
    const invoice = await stripe.invoices.retrieve(stripeInvoiceId);
    return toInvoiceDto(invoice);
  } catch (error) {
    translateStripeError(error, "INVOICE_NOT_FOUND");
  }
}
