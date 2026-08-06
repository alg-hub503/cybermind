import { requireCurrentUser } from "@/lib/require-current-user";
import { ADMIN_ROLE } from "@/lib/constants";
import { getClasses, getClassesBySchool } from "@/lib/features/classes/class-actions";
import { getSchools } from "@/lib/features/schools/school-actions";
import { getGradesBySchool, getGrades } from "@/lib/features/grades/grade-actions";
import { getAcademicYearsBySchool, getAcademicYears } from "@/lib/features/academic-years/academic-year-actions";
import { t } from "@/lib/i18n/server";
import ClassForm from "./ClassForm";
import ClassesList from "./ClassesList";

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

      <div className="mt-6">
        <ClassesList
          classes={classes}
          emptyTitle={noRecords}
          emptyDescription={emptyDescription}
        />
      </div>
    </main>
  );
}
