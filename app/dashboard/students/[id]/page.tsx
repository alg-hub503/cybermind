import { notFound } from "next/navigation";
import { requireResourceAccess } from "@/lib/authorization";
import { getStudentWithDetails } from "@/lib/features/students/student-actions";
import Link from "next/link";

interface StudentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentDetailPage({ params }: StudentDetailPageProps) {
  const { id } = await params;
  const student = await getStudentWithDetails(id);

  try {
    await requireResourceAccess(student);
  } catch {
    notFound();
  }

  if (!student) {
    notFound();
  }

  const sortedHistory = [...student.academicHistory].sort(
    (a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime()
  );

  const renderDate = (date: Date | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <main className="p-6">
      <div className="mb-6">
        <Link
          href="/dashboard/students"
          className="text-sm text-indigo-600 hover:underline"
        >
          ← Back to Students
        </Link>
        <h1 className="mt-2 text-2xl font-bold">
          {student.firstName} {student.lastName}
        </h1>
        <p className="text-gray-500">Code: {student.code}</p>
        <p className="text-gray-500">Status: {student.status}</p>
        {student.dateOfBirth && (
          <p className="text-gray-500">
            Date of Birth: {renderDate(student.dateOfBirth)}
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Academic History</h2>
        {sortedHistory.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            No academic history available.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {sortedHistory.map((record, idx) => (
              <li
                key={`${record.academicYear.id}-${record.class.id}-${idx}`}
                className="border-l-4 border-indigo-200 pl-4"
              >
                <p className="font-medium">{record.academicYear.name}</p>
                <p className="text-sm text-slate-600">
                  Class: {record.class.name}
                </p>
                <p className="text-sm text-slate-500">
                  Enrolled: {renderDate(record.enrolledAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
