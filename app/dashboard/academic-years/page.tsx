import { requireCurrentUser } from "@/lib/require-current-user";
import { ADMIN_ROLE } from "@/lib/constants";
import { getAcademicYears, getAcademicYearsBySchool } from "@/lib/features/academic-years/academic-year-actions";
import { getSchools } from "@/lib/features/schools/school-actions";
import { t } from "@/lib/i18n/server";
import AcademicYearForm from "./AcademicYearForm";
import EditAcademicYearButton from "./EditAcademicYearButton";
import DeleteAcademicYearButton from "./DeleteAcademicYearButton";
import EmptyState from "@/components/ui/empty-state";

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
  const nameLabel = await t("academicYears.name");
  const startDateLabel = await t("academicYears.startDate");
  const endDateLabel = await t("academicYears.endDate");
  const currentLabel = await t("academicYears.current");
  const actionsLabel = await t("academicYears.actions");
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

      {years.length === 0 ? (
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
                <th className="p-3 text-left">{startDateLabel}</th>
                <th className="p-3 text-left">{endDateLabel}</th>
                <th className="p-3 text-left">{currentLabel}</th>
                <th className="p-3 text-right">{actionsLabel}</th>
              </tr>
            </thead>

            <tbody>
              {years.map((year) => (
                <tr key={year.id} className="border-b">
                  <td className="p-3 font-medium">{year.name}</td>
                  <td className="p-3">{new Date(year.startDate).toLocaleDateString()}</td>
                  <td className="p-3">{new Date(year.endDate).toLocaleDateString()}</td>
                  <td className="p-3">
                    {year.isCurrent && (
                      <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                        {currentLabel}
                      </span>
                    )}
                  </td>
                  <td className="flex justify-end gap-2 p-3">
                    <EditAcademicYearButton id={year.id} currentName={year.name} />
                    <DeleteAcademicYearButton id={year.id} />
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
