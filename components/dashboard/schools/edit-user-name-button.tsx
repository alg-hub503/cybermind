"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { useTranslations } from "@/lib/i18n/use-translations";

interface EditUserNameButtonProps {
  schoolId: string;
  userId: string;
  currentName: string;
}

export default function EditUserNameButton({
  schoolId,
  userId,
  currentName,
}: EditUserNameButtonProps) {
  const { t } = useTranslations("schoolUsers");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function edit() {
    const name = window.prompt(t("editNamePrompt"), currentName);
    if (!name || name.trim() === currentName) return;

    setError(null);

    try {
      const res = await fetch(`/api/schools/${schoolId}/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? t("editNameFailed"));
        return;
      }

      router.refresh();
    } catch {
      setError(t("editNameFailed"));
    }
  }

  return (
    <div className="relative">
      <button
        title="Edit"
        type="button"
        onClick={edit}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500 text-white transition hover:bg-yellow-600"
      >
        <Pencil size={16} />
      </button>
      {error && (
        <p className="absolute right-0 top-full mt-1 w-48 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
