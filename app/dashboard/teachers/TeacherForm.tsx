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

interface TeacherFormProps {
  schoolId?: string;
  schools?: SchoolOption[];
}

export default function TeacherForm({ schoolId, schools }: TeacherFormProps) {
  const { t } = useTranslations("teachers");
  const router = useRouter();

  const [selectedSchoolId, setSelectedSchoolId] = useState(schoolId ?? "");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [hireDate, setHireDate] = useState("");
  const [loading, setLoading] = useState(false);

  const isAdmin = !schoolId && schools !== undefined;

  async function createTeacher() {
    const targetSchoolId = isAdmin ? selectedSchoolId : schoolId;

    if (!targetSchoolId) {
      toast.error(t("selectSchoolRequired"));
      return;
    }

    if (!name.trim()) {
      toast.error(t("nameRequired"));
      return;
    }

    if (!email.trim()) {
      toast.error(t("emailRequired"));
      return;
    }

    if (!password.trim()) {
      toast.error(t("passwordRequired"));
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolId: targetSchoolId,
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
          phone: phone.trim() || null,
          specialization: specialization.trim() || null,
          qualifications: qualifications.trim() || null,
          hireDate: hireDate || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const fieldError = data.details?.fieldErrors ? Object.values(data.details.fieldErrors).flat()[0] : undefined;
        toast.error(fieldError ?? data.error ?? t("failedCreate"));
        return;
      }

      setName("");
      setEmail("");
      setPassword("");
      setPhone("");
      setSpecialization("");
      setQualifications("");
      setHireDate("");
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
          placeholder={t("emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          type="email"
        />

        <Input
          placeholder={t("passwordPlaceholder")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          type="password"
        />

        <Input
          placeholder={t("phonePlaceholder")}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={loading}
        />

        <Input
          placeholder={t("specializationPlaceholder")}
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          disabled={loading}
        />

        <Input
          placeholder={t("qualificationsPlaceholder")}
          value={qualifications}
          onChange={(e) => setQualifications(e.target.value)}
          disabled={loading}
        />

        <Input
          placeholder={t("hireDatePlaceholder")}
          value={hireDate}
          onChange={(e) => setHireDate(e.target.value)}
          disabled={loading}
          type="date"
        />

        <Button onClick={createTeacher} disabled={loading}>
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
