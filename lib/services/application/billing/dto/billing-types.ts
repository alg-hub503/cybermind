export interface InvoiceDto {
  id: string;
  number: string | null;
  status: string;
  total: number;
  currency: string;
  hostedInvoiceUrl: string | null;
  invoicePdf: string | null;
  createdAt: number;
}

export interface PaymentDto {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description: string | null;
  createdAt: number;
}

export interface RefundDto {
  id: string;
  amount: number;
  currency: string;
  status: string;
  reason: string | null;
  createdAt: number;
}

export interface PaginationParams {
  startingAfter?: string;
  endingBefore?: string;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  hasMore: boolean;
}

export interface BillingExportItemDto {
  id: string;
  type: "invoice" | "payment" | "refund";
  amount: number;
  currency: string;
  status: string;
  description: string | null;
  createdAt: number;
  stripeUrl: string | null;
}

export interface BillingExportResultDto {
  items: BillingExportItemDto[];
  totalInvoices: number;
  totalPayments: number;
  totalRefunds: number;
  totalAmount: number;
}

export function toInvoiceDto(invoice: {
  id: string;
  number: string | null;
  status: string | null;
  total: number;
  currency: string;
  hosted_invoice_url?: string | null;
  invoice_pdf?: string | null;
  created: number;
}): InvoiceDto {
  return {
    id: invoice.id,
    number: invoice.number,
    status: invoice.status ?? "unknown",
    total: invoice.total,
    currency: invoice.currency.toUpperCase(),
    hostedInvoiceUrl: invoice.hosted_invoice_url ?? null,
    invoicePdf: invoice.invoice_pdf ?? null,
    createdAt: invoice.created,
  };
}

export function toPaymentDto(payment: {
  id: string;
  amount_received: number;
  currency: string;
  status: string;
  description: string | null;
  created: number;
}): PaymentDto {
  return {
    id: payment.id,
    amount: payment.amount_received,
    currency: payment.currency.toUpperCase(),
    status: payment.status,
    description: payment.description,
    createdAt: payment.created,
  };
}

export function toRefundDto(refund: {
  id: string;
  amount: number;
  currency: string;
  status: string | null;
  reason: string | null;
  created: number;
}): RefundDto {
  return {
    id: refund.id,
    amount: refund.amount,
    currency: refund.currency.toUpperCase(),
    status: refund.status ?? "unknown",
    reason: refund.reason,
    createdAt: refund.created,
  };
}
