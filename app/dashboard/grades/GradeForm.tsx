"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "@/lib/i18n/use-translations";

import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Spinner from "@/components/ui/spinner";

interface SchoolOption {
  id: string;
  name: string;
}

interface GradeFormProps {
  schoolId?: string;
  schools?: SchoolOption[];
}

export default function GradeForm({ schoolId, schools }: GradeFormProps) {
  const { t } = useTranslations("grades");
  const router = useRouter();

  const [selectedSchoolId, setSelectedSchoolId] = useState(schoolId ?? "");
  const [name, setName] = useState("");
  const [order, setOrder] = useState("");
  const [loading, setLoading] = useState(false);

  const isAdmin = !schoolId && schools !== undefined;

  async function createGrade() {
    const targetSchoolId = isAdmin ? selectedSchoolId : schoolId;

    if (!targetSchoolId) {
      toast.error(t("selectSchoolRequired"));
      return;
    }

    if (!name.trim()) {
      toast.error(t("nameRequired"));
      return;
    }

    const orderNum = parseInt(order, 10);
    if (isNaN(orderNum) || orderNum < 0) {
      toast.error(t("orderInvalid"));
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolId: targetSchoolId,
          name: name.trim(),
          order: orderNum,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const fieldError = data.details?.fieldErrors ? Object.values(data.details.fieldErrors).flat()[0] : undefined;
        toast.error(fieldError ?? data.error ?? t("failedCreate"));
        return;
      }

      setName("");
      setOrder("");
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
        <h2 className="text-lg font-semibold">{t("formTitle")}</h2>
        <p className="text-sm text-slate-500">{t("formDescription")}</p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:flex-wrap">
        {isAdmin && (
          <select
            value={selectedSchoolId}
            onChange={(e) => setSelectedSchoolId(e.target.value)}
            disabled={loading}
            className="rounded-lg border border-slate-300 px-4 py-2"
          >
            <option value="">{t("selectSchool")}</option>
            {schools?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        )}

        <Input
          placeholder={t("namePlaceholder")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />

        <Input
          placeholder={t("orderPlaceholder")}
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          disabled={loading}
          type="number"
          min="0"
        />

        <Button onClick={createGrade} disabled={loading}>
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
