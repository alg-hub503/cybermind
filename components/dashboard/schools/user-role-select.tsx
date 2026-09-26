"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/lib/i18n/use-translations";

const NO_ROLE_VALUE = "__none__";

interface RoleOption {
  id: string;
  name: string;
  systemKey: string | null;
}

interface UserRoleSelectProps {
  schoolId: string;
  userId: string;
  currentRoleId: string | null;
  currentRoleSystemKey: string | null;
  roles: RoleOption[];
}

export default function UserRoleSelect({
  schoolId,
  userId,
  currentRoleId,
  currentRoleSystemKey,
  roles,
}: UserRoleSelectProps) {
  const { t } = useTranslations("schoolUsers");
  const router = useRouter();

  const [value, setValue] = useState(currentRoleId ?? NO_ROLE_VALUE);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function commit(nextValue: string) {
    setPending(true);
    setError(null);

    try {
      const res =
        nextValue === NO_ROLE_VALUE
          ? await fetch(`/api/schools/${schoolId}/users/${userId}/role`, {
              method: "DELETE",
            })
          : await fetch(`/api/schools/${schoolId}/users/${userId}/role`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ roleId: nextValue }),
            });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setValue(currentRoleId ?? NO_ROLE_VALUE); // revert the select
        setError(body.error ?? t("roleChangeFailed"));
        return;
      }

      setValue(nextValue);
      router.refresh();
    } catch {
      setValue(currentRoleId ?? NO_ROLE_VALUE);
      setError(t("roleChangeFailed"));
    } finally {
      setPending(false);
    }
  }

  function handleChange(nextValue: string) {
    setValue(nextValue); // optimistic, reverted on failure inside commit()

    const isDowngradingFromSchoolAdmin =
      currentRoleSystemKey === "SCHOOL_ADMIN" && nextValue !== currentRoleId;

    if (isDowngradingFromSchoolAdmin) {
      const confirmed = window.confirm(t("roleChangeConfirm"));
      if (!confirmed) {
        setValue(currentRoleId ?? NO_ROLE_VALUE);
        return;
      }
    }

    void commit(nextValue);
  }

  return (
    <div className="flex flex-col gap-1">
      <select
        value={value}
        disabled={pending}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-60"
      >
        <option value={NO_ROLE_VALUE}>{t("noRole")}</option>
        {roles.map((role) => (
          <option key={role.id} value={role.id}>
            {role.name}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
