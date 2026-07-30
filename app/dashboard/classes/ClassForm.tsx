"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "@/lib/i18n/use-translations";

import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Spinner from "@/components/ui/spinner";

interface Option {
  id: string;
  name: string;
}

interface SchoolOption {
  id: string;
  name: string;
}

interface ClassFormProps {
  schoolId?: string;
  schools?: SchoolOption[];
  grades: Option[];
  academicYears: Option[];
}

export default function ClassForm({ schoolId, schools, grades, academicYears }: ClassFormProps) {
  const { t } = useTranslations("classes");
  const router = useRouter();

  const [selectedSchoolId, setSelectedSchoolId] = useState(schoolId ?? "");
  const [selectedGradeId, setSelectedGradeId] = useState("");
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const isAdmin = !schoolId && schools !== undefined;

  async function createClass() {
    const targetSchoolId = isAdmin ? selectedSchoolId : schoolId;

    if (!targetSchoolId) {
      toast.error(t("selectSchoolRequired"));
      return;
    }

    if (!selectedGradeId) {
      toast.error(t("selectGradeRequired"));
      return;
    }

    if (!selectedAcademicYearId) {
      toast.error(t("selectAcademicYearRequired"));
      return;
    }

    if (!name.trim()) {
      toast.error(t("nameRequired"));
      return;
    }

    if (!code.trim()) {
      toast.error(t("codeRequired"));
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolId: targetSchoolId,
          gradeId: selectedGradeId,
          academicYearId: selectedAcademicYearId,
          name: name.trim(),
          code: code.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const fieldError = data.details?.fieldErrors ? Object.values(data.details.fieldErrors).flat()[0] : undefined;
        toast.error(fieldError ?? data.error ?? t("failedCreate"));
        return;
      }

      setSelectedGradeId("");
      setSelectedAcademicYearId("");
      setName("");
      setCode("");
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

        <select
          value={selectedGradeId}
          onChange={(e) => setSelectedGradeId(e.target.value)}
          disabled={loading}
          className="rounded-lg border border-slate-300 px-4 py-2"
        >
          <option value="">{t("selectGrade")}</option>
          {grades.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>

        <select
          value={selectedAcademicYearId}
          onChange={(e) => setSelectedAcademicYearId(e.target.value)}
          disabled={loading}
          className="rounded-lg border border-slate-300 px-4 py-2"
        >
          <option value="">{t("selectAcademicYear")}</option>
          {academicYears.map((ay) => (
            <option key={ay.id} value={ay.id}>
              {ay.name}
            </option>
          ))}
        </select>

        <Input
          placeholder={t("namePlaceholder")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />

        <Input
          placeholder={t("codePlaceholder")}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={loading}
        />

        <Button onClick={createClass} disabled={loading}>
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
