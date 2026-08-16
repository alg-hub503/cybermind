import { notFound } from "next/navigation";
import { requireResourceAccess } from "@/lib/authorization";
import { getClassWithDetails } from "@/lib/features/classes/class-actions";
import Link from "next/link";

interface ClassDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClassDetailPage({ params }: ClassDetailPageProps) {
  const { id } = await params;
  const cls = await getClassWithDetails(id);

  try {
    await requireResourceAccess(cls);
  } catch {
    notFound();
  }

  if (!cls) {
    notFound();
  }

  return (
    <main className="p-6">
      <div className="mb-6">
        <Link
          href="/dashboard/classes"
          className="text-sm text-indigo-600 hover:underline"
        >
          ← Back to Classes
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{cls.name}</h1>
        <p className="text-gray-500">Code: {cls.code}</p>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Details</h2>
        <div className="mt-2 space-y-1 text-sm">
          <p>
            <span className="font-medium text-slate-600">Grade:</span>{" "}
            {cls.grade.name}
          </p>
          <p>
            <span className="font-medium text-slate-600">Academic Year:</span>{" "}
            {cls.academicYear.name}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">
          Students ({cls.students.length})
        </h2>
        {cls.students.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No students enrolled yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {cls.students.map((student) => (
              <li key={student.id} className="py-2">
                <p className="font-medium">
                  {student.firstName} {student.lastName}
                </p>
                <p className="text-sm text-slate-500">{student.code}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
