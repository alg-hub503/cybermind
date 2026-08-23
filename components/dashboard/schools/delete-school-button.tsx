"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "@/lib/i18n/use-translations";

export default function DeleteSchoolButton({
  id,
  schoolName,
}: {
  id: string;
  schoolName: string;
}) {
  const { t } = useTranslations("schoolHeader");
  const router = useRouter();

  async function remove() {
    const confirmed = window.confirm(
      t("confirmDelete", { name: schoolName })
    );
    if (!confirmed) return;

    const finalConfirm = window.confirm(t("confirmDeleteFinal"));
    if (!finalConfirm) return;

    await fetch(`/api/schools/${id}`, {
      method: "DELETE",
    });

    window.location.href = "/dashboard/schools";
  }

  return (
    <button
      onClick={remove}
      title={t("deleteSchool")}
      className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 font-semibold text-red-600 transition hover:bg-red-100"
    >
      {t("deleteSchool")}
    </button>
  );
}
