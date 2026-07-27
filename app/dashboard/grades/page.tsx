import { requireCurrentUser } from "@/lib/require-current-user";
import { ADMIN_ROLE } from "@/lib/constants";
import { getGrades, getGradesBySchool } from "@/lib/features/grades/grade-actions";
import { getSchools } from "@/lib/features/schools/school-actions";
import GradeForm from "./GradeForm";
import EditGradeButton from "./EditGradeButton";
import DeleteGradeButton from "./DeleteGradeButton";
import EmptyState from "@/components/ui/empty-state";

export default async function GradesPage() {
  const { user } = await requireCurrentUser();

  const grades = user.role === ADMIN_ROLE
    ? await getGrades()
    : user.schoolId
      ? await getGradesBySchool(user.schoolId)
      : [];

  const isAdmin = user.role === ADMIN_ROLE;

  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Grades</h1>
        <p className="text-gray-500">Manage grade levels</p>
      </div>

      {isAdmin ? (
        <GradeForm schools={await getSchools()} />
      ) : user.schoolId ? (
        <GradeForm schoolId={user.schoolId} />
      ) : null}

      {grades.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No grades yet"
            description="Create your first grade to get started."
          />
        </div>
      ) : (
        <div className="mt-6 rounded-lg border bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Order</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((grade) => (
                <tr key={grade.id} className="border-b">
                  <td className="p-3 font-medium">{grade.name}</td>
                  <td className="p-3">{grade.order}</td>
                  <td className="flex justify-end gap-2 p-3">
                    <EditGradeButton id={grade.id} currentName={grade.name} currentOrder={grade.order} />
                    <DeleteGradeButton id={grade.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
