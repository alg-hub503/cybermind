"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import Button from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";

interface DeleteInvoiceButtonProps {
  id: string;
}

export default function DeleteInvoiceButton({
  id,
}: DeleteInvoiceButtonProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function deleteInvoice() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this invoice?"
    );

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
        toast.error(data.error ?? "Delete failed");
        return;
      }

      toast.success("Invoice deleted successfully");

      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
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
          Deleting...
        </span>
      ) : (
        "Delete"
      )}
    </Button>
  );
}