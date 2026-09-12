"use client";

import { useEffect, useState } from "react";

interface Teacher {
  id: string;
  user: { id: string; name: string | null };
  schoolId: string;
}

interface SubjectAssignment {
  id: string;
  subject: string;
  teacherId: string;
  teacher?: { id: string; user: { name: string | null } };
}

interface Props {
  classId: string;
  schoolId: string;
}

export default function SubjectAssignmentsPanel({ classId, schoolId }: Props) {
  const [assignments, setAssignments] = useState<SubjectAssignment[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subject, setSubject] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canManage, setCanManage] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [assignRes, teachersRes] = await Promise.all([
          fetch(`/api/subject-assignments?classId=${classId}`),
          fetch("/api/teachers"),
        ]);

        if (!cancelled && assignRes.ok) {
          setAssignments(await assignRes.json());
        }

        if (teachersRes.status === 403) {
          if (!cancelled) setCanManage(false);
        } else if (!cancelled && teachersRes.ok) {
          const all: Teacher[] = await teachersRes.json();
          setTeachers(all.filter((t) => t.schoolId === schoolId));
        }
      } catch {
        if (!cancelled) setError("Failed to load data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [classId, schoolId, refreshKey]);

  const handleAdd = async () => {
    if (!subject.trim() || !teacherId) return;
    setAdding(true);
    setError(null);
    try {
      const res = await fetch("/api/subject-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId, schoolId, subject: subject.trim(), teacherId }),
      });
      if (res.status === 403) {
        setCanManage(false);
        return;
      }
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to add assignment");
        return;
      }
      setSubject("");
      setTeacherId("");
      setRefreshKey((k) => k + 1);
    } catch {
      setError("Failed to add assignment");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/subject-assignments/${id}`, { method: "DELETE" });
      if (res.status === 403) {
        setCanManage(false);
        return;
      }
      if (!res.ok) {
        setError("Failed to remove assignment");
        return;
      }
      setRefreshKey((k) => k + 1);
    } catch {
      setError("Failed to remove assignment");
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Loading subject assignments…</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">
        Subject Assignments ({assignments.length})
      </h2>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      {assignments.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">No subjects assigned yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-slate-100">
          {assignments.map((a) => (
            <li key={a.id} className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">{a.subject}</p>
                <p className="text-sm text-slate-500">
                  {a.teacher?.user?.name ?? "Unknown teacher"}
                </p>
              </div>
              {canManage && (
                <button
                  onClick={() => handleDelete(a.id)}
                  className="text-sm text-red-500 hover:underline"
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {canManage && (
        <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-slate-100 pt-4">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-sm font-medium text-slate-700">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Mathematics"
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-sm font-medium text-slate-700">
              Teacher
            </label>
            <select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Select teacher</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.user.name ?? "Unnamed"}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAdd}
            disabled={adding || !subject.trim() || !teacherId}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {adding ? "Adding…" : "Add"}
          </button>
        </div>
      )}
    </div>
  );
}
