"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "@/lib/i18n/use-translations";

interface EditInvoiceButtonProps {
  id: string;
}

export default function EditInvoiceButton({ id }: EditInvoiceButtonProps) {
  const { t } = useTranslations("invoices.edit");
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/dashboard/invoices/${id}?edit=true`)}
      title={t("edit")}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-white transition hover:bg-amber-600"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
      </svg>
    </button>
  );
}
