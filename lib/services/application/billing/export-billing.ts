import { stripe } from "@/lib/infrastructure/stripe/stripe-client";
import { PrismaBillingRepository } from "@/lib/infrastructure/persistence/prisma/prisma-billing-repository";
import { BillingError, translateStripeError } from "./stripe-error";
import { type BillingExportResultDto, type BillingExportItemDto } from "./dto/billing-types";

const billingRepo = new PrismaBillingRepository();

export async function exportBilling(schoolId: string): Promise<BillingExportResultDto> {
  const stripeCustomerId = await billingRepo.getStripeCustomerId(schoolId);

  if (!stripeCustomerId) {
    throw new BillingError("No Stripe customer found for this school", "NO_STRIPE_CUSTOMER");
  }

  try {
    const [stripeInvoices, paymentIntents] = await Promise.all([
      stripe.invoices.list({ customer: stripeCustomerId, limit: 100 }),
      stripe.paymentIntents.list({ customer: stripeCustomerId, limit: 100 }),
    ]);

    const paymentIntentIds = new Set(paymentIntents.data.map((pi) => pi.id));

    const allRefunds = await stripe.refunds.list({ limit: 100 });
    const customerRefunds = allRefunds.data.filter((refund) => {
      const piId = typeof refund.payment_intent === "string"
        ? refund.payment_intent
        : refund.payment_intent?.id;
      return piId ? paymentIntentIds.has(piId) : false;
    });

    const items: BillingExportItemDto[] = [];
    let totalAmount = 0;

    for (const invoice of stripeInvoices.data) {
      const status = invoice.status ?? "unknown";
      items.push({
        id: invoice.id,
        type: "invoice",
        amount: invoice.total,
        currency: invoice.currency.toUpperCase(),
        status,
        description: invoice.description ?? null,
        createdAt: invoice.created,
        stripeUrl: invoice.hosted_invoice_url ?? null,
      });
      if (status === "paid") {
        totalAmount += invoice.total;
      }
    }

    for (const payment of paymentIntents.data) {
      items.push({
        id: payment.id,
        type: "payment",
        amount: payment.amount_received,
        currency: payment.currency.toUpperCase(),
        status: payment.status,
        description: payment.description ?? null,
        createdAt: payment.created,
        stripeUrl: null,
      });
      if (payment.status === "succeeded") {
        totalAmount += payment.amount_received;
      }
    }

    for (const refund of customerRefunds) {
      items.push({
        id: refund.id,
        type: "refund",
        amount: -refund.amount,
        currency: refund.currency.toUpperCase(),
        status: refund.status ?? "unknown",
        description: refund.reason ?? null,
        createdAt: refund.created,
        stripeUrl: null,
      });
      totalAmount -= refund.amount;
    }

    items.sort((a, b) => b.createdAt - a.createdAt);

    return {
      items,
      totalInvoices: stripeInvoices.data.length,
      totalPayments: paymentIntents.data.length,
      totalRefunds: customerRefunds.length,
      totalAmount,
    };
  } catch (error) {
    translateStripeError(error, "EXPORT_FAILED");
  }
}
