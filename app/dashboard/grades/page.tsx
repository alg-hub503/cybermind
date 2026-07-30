import { requireCurrentUser } from "@/lib/require-current-user";
import { ADMIN_ROLE } from "@/lib/constants";
import { getGrades, getGradesBySchool } from "@/lib/features/grades/grade-actions";
import { getSchools } from "@/lib/features/schools/school-actions";
import { t } from "@/lib/i18n/server";
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

  const title = await t("grades.title");
  const description = await t("grades.description");
  const nameLabel = await t("grades.name");
  const orderLabel = await t("grades.order");
  const actionsLabel = await t("grades.actions");
  const noRecords = await t("grades.noRecords");
  const emptyDescription = await t("grades.emptyDescription");

  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-gray-500">{description}</p>
      </div>

      {isAdmin ? (
        <GradeForm schools={await getSchools()} />
      ) : user.schoolId ? (
        <GradeForm schoolId={user.schoolId} />
      ) : null}

      {grades.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title={noRecords}
            description={emptyDescription}
          />
        </div>
      ) : (
        <div className="mt-6 rounded-lg border bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-3 text-left">{nameLabel}</th>
                <th className="p-3 text-left">{orderLabel}</th>
                <th className="p-3 text-right">{actionsLabel}</th>
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
