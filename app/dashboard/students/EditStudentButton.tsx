"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "@/lib/i18n/use-translations";

export default function EditStudentButton({
  id,
  currentFirstName,
  currentLastName,
  currentCode,
}: {
  id: string;
  currentFirstName: string;
  currentLastName: string;
  currentCode: string;
}) {
  const { t } = useTranslations("students");
  const router = useRouter();

  async function edit() {
    const firstName = prompt(t("editPromptFirstName"), currentFirstName);
    if (!firstName) return;

    const lastName = prompt(t("editPromptLastName"), currentLastName);
    if (!lastName) return;

    const code = prompt(t("editPromptCode"), currentCode);
    if (!code) return;

    await fetch(`/api/students/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, code }),
    });

    router.refresh();
  }

  return (
    <button onClick={edit} className="rounded-lg bg-yellow-500 px-3 py-2 text-white">
      {t("edit")}
    </button>
  );
}
