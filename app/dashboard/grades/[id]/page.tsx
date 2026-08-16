import { notFound } from "next/navigation";
import { requireCurrentUser } from "@/lib/require-current-user";
import { getGradeWithClasses } from "@/lib/features/grades/grade-actions";
import { ADMIN_ROLE } from "@/lib/constants";
import Link from "next/link";
interface GradeDetailPageProps {
  params: Promise<{ id: string }>;
}
export default async function GradeDetailPage({ params }: GradeDetailPageProps) {
  const { id } = await params;
  const { user } = await requireCurrentUser();
  const isAdmin = user.role === ADMIN_ROLE;
  const grade = await getGradeWithClasses(id);
  if (!grade) {
    notFound();
  }
  if (!isAdmin && grade.schoolId !== user.schoolId) {
    notFound();
  }
  return (
    <main className="p-6">
      <div className="mb-6">
        <Link href="/dashboard/grades" className="text-sm text-indigo-600 hover:underline">
          ← Back to Grades
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{grade.name}</h1>
        <p className="text-gray-500">Order: {grade.order}</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Classes ({grade.classes.length})</h2>
        {grade.classes.length === 0 ? (
          <p className="text-sm text-slate-500">No classes yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {grade.classes.map((cls) => (
              <li key={cls.id} className="py-3">
                <p className="font-medium">{cls.name}</p>
                <p className="text-sm text-slate-500">
                  {cls.code} · {cls.academicYear.name}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
