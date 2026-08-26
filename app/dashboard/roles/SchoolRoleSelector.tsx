"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface School {
  id: string;
  name: string;
}

interface SchoolRoleSelectorProps {
  schools: School[];
  selectedSchoolId: string | null;
  selectSchoolLabel: string;
}

export default function SchoolRoleSelector({
  schools,
  selectedSchoolId,
  selectSchoolLabel,
}: SchoolRoleSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("schoolId", value);
      } else {
        params.delete("schoolId");
      }
      router.push(`/dashboard/roles?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="mb-6">
      <label
        htmlFor="school-select"
        className="mb-2 block text-sm font-medium text-slate-700"
      >
        {selectSchoolLabel}
      </label>
      <select
        id="school-select"
        value={selectedSchoolId ?? ""}
        onChange={handleChange}
        className="w-full max-w-md rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      >
        <option value="">—</option>
        {schools.map((school) => (
          <option key={school.id} value={school.id}>
            {school.name}
          </option>
        ))}
      </select>
    </div>
  );
}
