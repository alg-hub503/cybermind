import { stripe } from "@/lib/infrastructure/stripe/stripe-client";
import { BillingError, translateStripeError } from "./stripe-error";
import { toInvoiceDto, type InvoiceDto } from "./dto/billing-types";

export async function deleteInvoice(stripeInvoiceId: string): Promise<InvoiceDto> {
  try {
    const invoice = await stripe.invoices.voidInvoice(stripeInvoiceId);
    return toInvoiceDto(invoice);
  } catch (error) {
    translateStripeError(error, "INVOICE_DELETE_FAILED");
  }
}
