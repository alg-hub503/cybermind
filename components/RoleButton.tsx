"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useTranslations } from "@/lib/i18n/use-translations";

import Button from "@/components/ui/button";

interface RoleButtonProps {
  userId: string;
  role: string;
}

export default function RoleButton({
  userId,
  role,
}: RoleButtonProps) {
  const router = useRouter();
  const { t } = useTranslations("admin");

  const [loading, setLoading] = useState(false);

  async function handleClick() {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/users/${userId}/role`,
        {
          method: "PATCH",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(
          data.error ?? t("roleUpdateFailed")
        );
        return;
      }

      toast.success(t("roleUpdated"));

      router.refresh();
    } catch (error) {
      console.error(error);

      toast.error(t("wentWrong"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      variant="outline"
    >
      {loading
        ? t("updating")
        : role === "ADMIN"
        ? t("makeUser")
        : t("makeAdmin")}
    </Button>
  );
}