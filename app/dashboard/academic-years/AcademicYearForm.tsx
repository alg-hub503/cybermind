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

interface AcademicYearFormProps {
  schoolId?: string;
  schools?: SchoolOption[];
}

export default function AcademicYearForm({ schoolId, schools }: AcademicYearFormProps) {
  const { t } = useTranslations("academicYears");
  const router = useRouter();

  const [selectedSchoolId, setSelectedSchoolId] = useState(schoolId ?? "");
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCurrent, setIsCurrent] = useState(false);
  const [loading, setLoading] = useState(false);

  const isAdmin = !schoolId && schools !== undefined;

  async function createAcademicYear() {
    const targetSchoolId = isAdmin ? selectedSchoolId : schoolId;

    if (!targetSchoolId) {
      toast.error(t("selectSchoolRequired"));
      return;
    }

    if (!name.trim()) {
      toast.error(t("nameRequired"));
      return;
    }

    if (!startDate) {
      toast.error(t("startDateRequired"));
      return;
    }

    if (!endDate) {
      toast.error(t("endDateRequired"));
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      toast.error(t("endDateAfterStart"));
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/academic-years", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          schoolId: targetSchoolId,
          name: name.trim(),
          startDate,
          endDate,
          isCurrent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const fieldError = data.details?.fieldErrors ? Object.values(data.details.fieldErrors).flat()[0] : undefined;
        toast.error(fieldError ?? data.error ?? t("failedCreate"));
        return;
      }

      setName("");
      setStartDate("");
      setEndDate("");
      setIsCurrent(false);

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

        <div>
          <label className="mb-1 block text-xs text-slate-500">{t("startDateLabel")}</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={loading}
            className="rounded-lg border border-slate-300 px-4 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-slate-500">{t("endDateLabel")}</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={loading}
            className="rounded-lg border border-slate-300 px-4 py-2"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isCurrent"
            checked={isCurrent}
            onChange={(e) => setIsCurrent(e.target.checked)}
            disabled={loading}
            className="h-4 w-4 rounded border-slate-300"
          />
          <label htmlFor="isCurrent" className="text-sm text-slate-600">
            {t("currentYear")}
          </label>
        </div>

        <Button onClick={createAcademicYear} disabled={loading}>
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
