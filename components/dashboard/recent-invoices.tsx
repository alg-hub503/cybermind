import Link from "next/link";
import { ArrowRight, ReceiptText } from "lucide-react";

interface Invoice {
  id: string;
  amount: number;
  createdAt: Date;
}

interface RecentInvoicesProps {
  invoices: Invoice[];
}

export default function RecentInvoices({
  invoices,
}: RecentInvoicesProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Latest Invoices
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Recently generated invoices.
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
          <ReceiptText size={22} />
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 py-10 text-center">
          <ReceiptText
            size={36}
            className="mx-auto mb-3 text-slate-300"
          />

          <p className="font-medium text-slate-600">
            No invoices found
          </p>

          <p className="mt-1 text-sm text-slate-500">
            This school doesn&apos;t have any invoices yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <Link
              key={invoice.id}
              href={`/dashboard/invoices/${invoice.id}`}
              className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 transition-all duration-200 hover:border-emerald-300 hover:bg-slate-50"
            >
              <div>
                <p className="text-lg font-bold text-slate-900">
                  ${invoice.amount.toFixed(2)}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {invoice.createdAt.toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Paid
                </span>

                <ArrowRight
                  size={18}
                  className="text-slate-400"
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
