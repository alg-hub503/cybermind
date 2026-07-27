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

interface GradeFormProps {
  schoolId?: string;
  schools?: SchoolOption[];
}

export default function GradeForm({ schoolId, schools }: GradeFormProps) {
  const router = useRouter();

  const [selectedSchoolId, setSelectedSchoolId] = useState(schoolId ?? "");
  const [name, setName] = useState("");
  const [order, setOrder] = useState("");
  const [loading, setLoading] = useState(false);

  const isAdmin = !schoolId && schools !== undefined;

  async function createGrade() {
    const targetSchoolId = isAdmin ? selectedSchoolId : schoolId;

    if (!targetSchoolId) {
      toast.error("Please select a school");
      return;
    }

    if (!name.trim()) {
      toast.error("Grade name is required");
      return;
    }

    const orderNum = parseInt(order, 10);
    if (isNaN(orderNum) || orderNum < 0) {
      toast.error("Order must be 0 or greater");
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
        toast.error(fieldError ?? data.error ?? "Failed to create grade");
        return;
      }

      setName("");
      setOrder("");
      router.refresh();
      toast.success("Grade created successfully");
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
        <h2 className="text-lg font-semibold">Create Grade</h2>
        <p className="text-sm text-slate-500">Add a new grade level to your school.</p>
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
          placeholder="e.g. Grade 1"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />

        <Input
          placeholder="Order (e.g. 0, 1, 2...)"
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
