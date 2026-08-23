"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "@/lib/i18n/use-translations";

export default function EditSchoolButton({
  id,
  currentName,
}: {
  id: string;
  currentName: string;
}) {
  const { t } = useTranslations("schoolHeader");
  const router = useRouter();

  async function edit() {
    const name = prompt(t("editPrompt"), currentName);
    if (!name || name === currentName) return;

    await fetch(`/api/schools/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });

    router.refresh();
  }

  return (
    <button
      onClick={edit}
      title={t("editSchool")}
      className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
    >
      {t("editSchool")}
    </button>
  );
}
