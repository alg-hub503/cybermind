"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "@/lib/i18n/use-translations";

interface ViewInvoiceButtonProps {
  id: string;
}

export default function ViewInvoiceButton({ id }: ViewInvoiceButtonProps) {
  const { t } = useTranslations("invoices.view");
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/dashboard/invoices/${id}`)}
      title={t("view")}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white transition hover:bg-indigo-700"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
      </svg>
    </button>
  );
}
