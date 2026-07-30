"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "@/lib/i18n/use-translations";

import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Spinner from "@/components/ui/spinner";

export default function SchoolForm() {
  const { t } = useTranslations("schools");
  const router = useRouter();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function createSchool() {
    if (!name.trim()) {
      toast.error(t("nameRequired"));
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/schools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error ?? t("failedCreate"));
        return;
      }

      setName("");

      router.refresh();

      toast.success(t("created"));
    } catch (error) {
      console.error(error);
      toast.error(t("failedCreate"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">
          {t("formTitle")}
        </h2>

        <p className="text-sm text-slate-500">
          {t("formDescription")}
        </p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <Input
          placeholder={t("namePlaceholder")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />

        <Button
          onClick={createSchool}
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Spinner size={18} />
              {t("creating")}
            </span>
          ) : (
            t("create")
          )}
        </Button>
      </div>
    </div>
  );
}
