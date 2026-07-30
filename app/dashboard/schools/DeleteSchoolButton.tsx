"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/lib/i18n/use-translations";

import Button from "@/components/ui/button";

interface Props {
  id: string;
}

export default function DeleteSchoolButton({
  id,
}: Props) {
  const { t } = useTranslations("schools");
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(t("confirmDelete"))) return;

    try {
      setLoading(true);

      const response = await fetch(`/api/schools/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        alert(t("deleteFailed"));
        return;
      }

      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="danger"
      disabled={loading}
      onClick={handleDelete}
    >
      {loading ? t("deleting") : t("delete")}
    </Button>
  );
}
