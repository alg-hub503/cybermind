import { requireCurrentUser } from "@/lib/require-current-user";
import { ADMIN_ROLE } from "@/lib/constants";
import { getAcademicYears, getAcademicYearsBySchool } from "@/lib/features/academic-years/academic-year-actions";
import { getSchools } from "@/lib/features/schools/school-actions";
import { t } from "@/lib/i18n/server";
import AcademicYearForm from "./AcademicYearForm";
import AcademicYearsList from "./AcademicYearsList";

export default async function AcademicYearsPage() {
  const { user } = await requireCurrentUser();

  const years = user.role === ADMIN_ROLE
    ? await getAcademicYears()
    : user.schoolId
      ? await getAcademicYearsBySchool(user.schoolId)
      : [];

  const isAdmin = user.role === ADMIN_ROLE;

  const title = await t("academicYears.title");
  const description = await t("academicYears.description");
  const noRecords = await t("academicYears.noRecords");
  const emptyDescription = await t("academicYears.emptyDescription");

  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-gray-500">{description}</p>
      </div>

      {isAdmin ? (
        <AcademicYearForm schools={await getSchools()} />
      ) : user.schoolId ? (
        <AcademicYearForm schoolId={user.schoolId} />
      ) : null}

      <div className="mt-6">
        <AcademicYearsList
          academicYears={years}
          emptyTitle={noRecords}
          emptyDescription={emptyDescription}
        />
      </div>
    </main>
  );
}
