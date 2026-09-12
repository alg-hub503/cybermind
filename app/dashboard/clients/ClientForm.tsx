"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "@/lib/i18n/use-translations";

interface ClientFormProps {
  schoolId?: string;
}

export default function ClientForm({ schoolId }: ClientFormProps) {
  const { t } = useTranslations("clients");
  const router = useRouter();

  const [name, setName] = useState("");

  async function addClient() {
    if (!name.trim()) return;

    const res = await fetch("/api/clients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name.trim(),
        ...(schoolId ? { schoolId } : {}),
      }),
    });

    if (res.ok) {
      setName("");
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t("namePlaceholder")}
        className="w-full flex-1 rounded-xl border px-4 py-2"
      />

      <button
        onClick={addClient}
        className="w-full rounded-xl bg-blue-600 px-4 py-2 text-white sm:w-auto"
      >
        {t("add")}
      </button>
    </div>
  );
}
