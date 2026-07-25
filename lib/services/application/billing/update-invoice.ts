import { stripe } from "@/lib/infrastructure/stripe/stripe-client";
import { BillingError, translateStripeError } from "./stripe-error";
import { toInvoiceDto, type InvoiceDto } from "./dto/billing-types";

interface UpdateInvoiceInput {
  description?: string;
  metadata?: Record<string, string>;
}

export async function updateInvoice(stripeInvoiceId: string, data: UpdateInvoiceInput): Promise<InvoiceDto> {
  try {
    const invoice = await stripe.invoices.update(stripeInvoiceId, {
      description: data.description,
      metadata: data.metadata,
    });
    return toInvoiceDto(invoice);
  } catch (error) {
    translateStripeError(error, "INVOICE_UPDATE_FAILED");
  }
}
