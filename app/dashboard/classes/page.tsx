import { requireCurrentUser } from "@/lib/require-current-user";
import { ADMIN_ROLE } from "@/lib/constants";
import { getClasses, getClassesBySchool } from "@/lib/features/classes/class-actions";
import { getSchools } from "@/lib/features/schools/school-actions";
import { getGradesBySchool, getGrades } from "@/lib/features/grades/grade-actions";
import { getAcademicYearsBySchool, getAcademicYears } from "@/lib/features/academic-years/academic-year-actions";
import { t } from "@/lib/i18n/server";
import ClassForm from "./ClassForm";
import EditClassButton from "./EditClassButton";
import DeleteClassButton from "./DeleteClassButton";
import EmptyState from "@/components/ui/empty-state";

export default async function ClassesPage() {
  const { user } = await requireCurrentUser();

  const classes = user.role === ADMIN_ROLE
    ? await getClasses()
    : user.schoolId
      ? await getClassesBySchool(user.schoolId)
      : [];

  const isAdmin = user.role === ADMIN_ROLE;

  const grades = user.role === ADMIN_ROLE ? await getGrades() : user.schoolId ? await getGradesBySchool(user.schoolId) : [];
  const academicYears = user.role === ADMIN_ROLE ? await getAcademicYears() : user.schoolId ? await getAcademicYearsBySchool(user.schoolId) : [];

  const title = await t("classes.title");
  const description = await t("classes.description");
  const nameLabel = await t("classes.name");
  const codeLabel = await t("classes.code");
  const actionsLabel = await t("classes.actions");
  const noRecords = await t("classes.noRecords");
  const emptyDescription = await t("classes.emptyDescription");

  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-gray-500">{description}</p>
      </div>

      {isAdmin ? (
        <ClassForm schools={await getSchools()} grades={grades} academicYears={academicYears} />
      ) : user.schoolId ? (
        <ClassForm schoolId={user.schoolId} grades={grades} academicYears={academicYears} />
      ) : null}

      {classes.length === 0 ? (
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
                <th className="p-3 text-left">{codeLabel}</th>
                <th className="p-3 text-right">{actionsLabel}</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((classe) => (
                <tr key={classe.id} className="border-b">
                  <td className="p-3 font-medium">{classe.name}</td>
                  <td className="p-3 text-gray-500">{classe.code}</td>
                  <td className="flex justify-end gap-2 p-3">
                    <EditClassButton id={classe.id} currentName={classe.name} currentCode={classe.code} />
                    <DeleteClassButton id={classe.id} />
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
