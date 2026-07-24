"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import Button from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";

type Client = {
  id: string;
  name: string;
};

interface InvoiceFormProps {
  clients: Client[];
}

export default function InvoiceForm({
  clients,
}: InvoiceFormProps) {
  const router = useRouter();

  const [clientId, setClientId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  async function createInvoice() {
    if (!clientId) {
      toast.error("Please select a client");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId,
          amount: Number(amount),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error ?? "Failed to create invoice");
        return;
      }

      toast.success("Invoice created successfully");

      setClientId("");
      setAmount("");

      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 md:flex-row">
      <select
        value={clientId}
        onChange={(e) => setClientId(e.target.value)}
        disabled={loading}
        className="rounded-lg border border-slate-300 px-4 py-2"
      >
        <option value="">Select Client</option>

        {clients.map((client) => (
          <option
            key={client.id}
            value={client.id}
          >
            {client.name}
          </option>
        ))}
      </select>

      <input
        type="number"
        min="1"
        placeholder="Amount"
        value={amount}
        disabled={loading}
        onChange={(e) => setAmount(e.target.value)}
        className="rounded-lg border border-slate-300 px-4 py-2"
      />

      <Button
        onClick={createInvoice}
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Spinner size={16} />
            Creating...
          </span>
        ) : (
          "Create Invoice"
        )}
      </Button>
    </div>
  );
}