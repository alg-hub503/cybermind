"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/lib/i18n/use-translations";

import Button from "@/components/ui/button";

interface Props {
  id: string;
  currentName: string;
}

export default function EditSchoolButton({
  id,
  currentName,
}: Props) {
  const { t } = useTranslations("schools");
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function handleEdit() {
    const name = prompt(t("editPrompt"), currentName);
    if (!name || name.trim() === "") return;

    try {
      setLoading(true);

      const response = await fetch(`/api/schools/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
        }),
      });

      if (!response.ok) {
        alert(t("failedUpdate"));
        return;
      }

      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="secondary"
      disabled={loading}
      onClick={handleEdit}
    >
      {loading ? t("saving") : t("edit")}
    </Button>
  );
}
