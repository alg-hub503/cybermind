"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "@/lib/i18n/use-translations";

import Button from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";

interface DeleteInvoiceButtonProps {
  id: string;
}

export default function DeleteInvoiceButton({
  id,
}: DeleteInvoiceButtonProps) {
  const { t } = useTranslations("invoices.delete");
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function deleteInvoice() {
    const confirmed = window.confirm(t("confirm"));

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `/api/invoices/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error ?? t("failed"));
        return;
      }

      toast.success(t("success"));

      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(t("wentWrong"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="danger"
      onClick={deleteInvoice}
      disabled={loading}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <Spinner size={16} />
          {t("deleting")}
        </span>
      ) : (
        t("delete")
      )}
    </Button>
  );
}