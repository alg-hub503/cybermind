"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "@/lib/i18n/use-translations";

export default function DeleteClientButton({
  id,
}: {
  id: string;
}) {
  const { t } = useTranslations("clients");
  const router = useRouter();

  async function remove() {
    const ok = confirm(t("confirmDelete"));
    if (!ok) return;

    await fetch(
      `/api/clients?id=${id}`,
      {
        method: "DELETE",
      }
    );

    router.refresh();
  }

  return (
    <button
      onClick={remove}
      className="rounded-lg bg-red-600 px-3 py-2 text-white"
    >
      {t("delete")}
    </button>
  );
}
