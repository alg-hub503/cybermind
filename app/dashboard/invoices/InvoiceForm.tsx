"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "@/lib/i18n/use-translations";

import Button from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";

type Client = {
  id: string;
  name: string;
};

type Student = {
  id: string;
  firstName: string;
  lastName: string;
};

type InvoiceOwner = {
  id: string;
  clientId: string | null;
  studentId: string | null;
  Client?: { name: string } | null;
  Student?: { firstName: string; lastName: string } | null;
};

interface InvoiceFormProps {
  clients: Client[];
  students: Student[];
  schoolId: string;
  mode?: "create" | "edit";
  existing?: InvoiceOwner | null;
}

export default function InvoiceForm({
  clients,
  students,
  schoolId,
  mode = "create",
  existing,
}: InvoiceFormProps) {
  const { t } = useTranslations("invoices.form");
  const router = useRouter();

  const initialOwnerId = existing?.id ?? "";
  const initialOwnerType = existing?.clientId ? "client" : existing?.studentId ? "student" : "client";
  const initialClientId = existing?.clientId ?? "";
  const initialStudentId = existing?.studentId ?? "";

  const [ownerType, setOwnerType] = useState<"client" | "student">(initialOwnerType);
  const [clientId, setClientId] = useState(initialClientId);
  const [studentId, setStudentId] = useState(initialStudentId);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const hasClient = ownerType === "client" && clientId;
  const hasStudent = ownerType === "student" && studentId;

  if (!hasClient && !hasStudent) {
    // Will trigger error toast in submit
  }

  async function submit() {
    if (!hasClient && !hasStudent) {
      toast.error(ownerType === "client" ? t("selectClientError") : t("selectStudentError"));
      return;
    }

    if (!amount || Number(amount) <= 0) {
      toast.error(t("amountError"));
      return;
    }

    const payload = {
      amount: Number(amount),
      schoolId,
      clientId: ownerType === "client" ? clientId : undefined,
      studentId: ownerType === "student" ? studentId : undefined,
    };

    const url = mode === "create" ? "/api/invoices" : `/api/invoices/${initialOwnerId}`;

    try {
      setLoading(true);

      const response = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error ?? t("createFailed"));
        return;
      }

      toast.success(t("createSuccess"));

      if (mode === "create") {
        setClientId("");
        setStudentId("");
        setAmount("");
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(t("wentWrong"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 md:flex-row">
      {mode === "edit" && existing ? (
        <div className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2">
          <span className="text-sm text-slate-500">
            {existing.Client?.name ??
              (existing.Student
                ? `${existing.Student.firstName} ${existing.Student.lastName}`
                : "—")}
          </span>
        </div>
      ) : (
        <>
          <div className="flex gap-2 rounded-lg border border-slate-200 p-1">
            <button
              type="button"
              onClick={() => setOwnerType("client")}
              className={`rounded-md px-3 py-1 text-sm font-medium transition ${
                ownerType === "client"
                  ? "bg-emerald-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {t("billClient")}
            </button>
            <button
              type="button"
              onClick={() => setOwnerType("student")}
              className={`rounded-md px-3 py-1 text-sm font-medium transition ${
                ownerType === "student"
                  ? "bg-emerald-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {t("billStudent")}
            </button>
          </div>

          {ownerType === "client" ? (
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              disabled={loading}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2"
            >
              <option value="">{t("selectClient")}</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          ) : (
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              disabled={loading}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2"
            >
              <option value="">{t("selectStudent")}</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.firstName} {student.lastName}
                </option>
              ))}
            </select>
          )}
        </>
      )}

      {mode === "create" && (
        <input
          type="number"
          min="1"
          placeholder={t("amountPlaceholder")}
          value={amount}
          disabled={loading}
          onChange={(e) => setAmount(e.target.value)}
          className="w-32 rounded-lg border border-slate-300 px-4 py-2"
        />
      )}

      {mode === "create" && (
        <Button onClick={submit} disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <Spinner size={16} />
              {t("creating")}
            </span>
          ) : (
            t("createInvoice")
          )}
        </Button>
      )}
    </div>
  );
}
