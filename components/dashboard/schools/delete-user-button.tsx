"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useTranslations } from "@/lib/i18n/use-translations";

interface DeleteUserButtonProps {
  schoolId: string;
  userId: string;
  userLabel: string;
}

export default function DeleteUserButton({
  schoolId,
  userId,
  userLabel,
}: DeleteUserButtonProps) {
  const { t } = useTranslations("schoolUsers");
  const router = useRouter();

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const confirmed = window.confirm(t("deleteConfirm", { name: userLabel }));
    if (!confirmed) return;

    setPending(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/schools/${schoolId}/users/${userId}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? t("deleteFailed"));
        setPending(false);
        return;
      }

      router.refresh();
    } catch {
      setError(t("deleteFailed"));
      setPending(false);
    }
  }

  return (
    <div className="relative">
      <button
        title="Delete"
        type="button"
        disabled={pending}
        onClick={handleDelete}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white transition hover:bg-red-700 disabled:opacity-60"
      >
        <Trash2 size={16} />
      </button>
      {error && (
        <p className="absolute right-0 top-full mt-1 w-48 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
