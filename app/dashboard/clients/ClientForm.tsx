"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "@/lib/i18n/use-translations";

export default function ClientForm() {
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
      }),
    });

    if (res.ok) {
      setName("");
      router.refresh();
    }
  }

  return (
    <div className="flex gap-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t("namePlaceholder")}
        className="rounded-xl border px-4 py-2"
      />

      <button
        onClick={addClient}
        className="rounded-xl bg-blue-600 px-4 py-2 text-white"
      >
        {t("add")}
      </button>
    </div>
  );
}
