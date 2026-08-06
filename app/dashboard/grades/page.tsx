import { requireCurrentUser } from "@/lib/require-current-user";
import { ADMIN_ROLE } from "@/lib/constants";
import { getGrades, getGradesBySchool } from "@/lib/features/grades/grade-actions";
import { getSchools } from "@/lib/features/schools/school-actions";
import { t } from "@/lib/i18n/server";
import GradeForm from "./GradeForm";
import GradesList from "./GradesList";

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

      <div className="mt-6">
        <GradesList
          grades={grades}
          emptyTitle={noRecords}
          emptyDescription={emptyDescription}
        />
      </div>
    </main>
  );
}
