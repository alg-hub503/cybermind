"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
      toast.error("Please select a school");
      return;
    }

    if (!name.trim()) {
      toast.error("Academic year name is required");
      return;
    }

    if (!startDate) {
      toast.error("Start date is required");
      return;
    }

    if (!endDate) {
      toast.error("End date is required");
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      toast.error("End date must be after start date");
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
        toast.error(fieldError ?? data.error ?? "Failed to create academic year");
        return;
      }

      setName("");
      setStartDate("");
      setEndDate("");
      setIsCurrent(false);

      router.refresh();

      toast.success("Academic year created successfully");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Create Academic Year</h2>
        <p className="text-sm text-slate-500">Add a new academic year to your school.</p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:flex-wrap">
        {isAdmin && (
          <select
            value={selectedSchoolId}
            onChange={(e) => setSelectedSchoolId(e.target.value)}
            disabled={loading}
            className="rounded-lg border border-slate-300 px-4 py-2"
          >
            <option value="">Select a school</option>
            {schools?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        )}

        <Input
          placeholder="e.g. 2025-2026"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />

        <div>
          <label className="mb-1 block text-xs text-slate-500">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={loading}
            className="rounded-lg border border-slate-300 px-4 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-slate-500">End Date</label>
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
            Current year
          </label>
        </div>

        <Button onClick={createAcademicYear} disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <Spinner size={18} />
              Creating...
            </span>
          ) : (
            "Create"
          )}
        </Button>
      </div>
    </div>
  );
}
