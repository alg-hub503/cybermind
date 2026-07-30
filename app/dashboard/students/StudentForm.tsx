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

interface StudentFormProps {
  schoolId?: string;
  schools?: SchoolOption[];
}

export default function StudentForm({ schoolId, schools }: StudentFormProps) {
  const { t } = useTranslations("students");
  const router = useRouter();

  const [selectedSchoolId, setSelectedSchoolId] = useState(schoolId ?? "");
  const [code, setCode] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [loading, setLoading] = useState(false);

  const isAdmin = !schoolId && schools !== undefined;

  async function createStudent() {
    const targetSchoolId = isAdmin ? selectedSchoolId : schoolId;

    if (!targetSchoolId) {
      toast.error(t("selectSchoolRequired"));
      return;
    }

    if (!code.trim()) {
      toast.error(t("codeRequired"));
      return;
    }

    if (!firstName.trim()) {
      toast.error(t("firstNameRequired"));
      return;
    }

    if (!lastName.trim()) {
      toast.error(t("lastNameRequired"));
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolId: targetSchoolId,
          code: code.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          dateOfBirth: dateOfBirth || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const fieldError = data.details?.fieldErrors ? Object.values(data.details.fieldErrors).flat()[0] : undefined;
        toast.error(fieldError ?? data.error ?? t("failedCreate"));
        return;
      }

      setCode("");
      setFirstName("");
      setLastName("");
      setDateOfBirth("");
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
          placeholder={t("codePlaceholder")}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={loading}
        />

        <Input
          placeholder={t("firstNamePlaceholder")}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          disabled={loading}
        />

        <Input
          placeholder={t("lastNamePlaceholder")}
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          disabled={loading}
        />

        <Input
          placeholder={t("dateOfBirth")}
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          disabled={loading}
          type="date"
        />

        <Button onClick={createStudent} disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <Spinner size={18} />
              {t("enrolling")}
            </span>
          ) : (
            t("enroll")
          )}
        </Button>
      </div>
    </div>
  );
}
