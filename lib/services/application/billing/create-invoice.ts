import { stripe } from "@/lib/infrastructure/stripe/stripe-client";
import { PrismaBillingRepository } from "@/lib/infrastructure/persistence/prisma/prisma-billing-repository";
import { BillingError, translateStripeError } from "./stripe-error";
import { toInvoiceDto, type InvoiceDto } from "./dto/billing-types";

const billingRepo = new PrismaBillingRepository();

interface CreateInvoiceInput {
  schoolId: string;
  amount: number;
  currency?: string;
  description?: string;
}

export async function createInvoice(input: CreateInvoiceInput): Promise<InvoiceDto> {
  const stripeCustomerId = await billingRepo.getStripeCustomerId(input.schoolId);

  if (!stripeCustomerId) {
    throw new BillingError("No Stripe customer found for this school", "NO_STRIPE_CUSTOMER");
  }

  const idempotencyKey = `create-invoice:${input.schoolId}:${Math.round(input.amount * 100)}:${input.currency ?? "usd"}`;

  try {
    const invoice = await stripe.invoices.create({
      customer: stripeCustomerId,
      currency: input.currency ?? "usd",
      description: input.description,
      auto_advance: false,
      metadata: {
        schoolId: input.schoolId,
      },
    }, { idempotencyKey });

    await stripe.invoiceItems.create({
      customer: stripeCustomerId,
      amount: Math.round(input.amount * 100),
      currency: input.currency ?? "usd",
      description: input.description ?? "Invoice item",
      invoice: invoice.id,
    });

    const updated = await stripe.invoices.retrieve(invoice.id);

    return toInvoiceDto(updated);
  } catch (error) {
    translateStripeError(error, "INVOICE_CREATE_FAILED");
  }
}
