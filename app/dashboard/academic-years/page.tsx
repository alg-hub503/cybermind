import { requireCurrentUser } from "@/lib/require-current-user";
import { ADMIN_ROLE } from "@/lib/constants";
import { getAcademicYears, getAcademicYearsBySchool } from "@/lib/features/academic-years/academic-year-actions";
import { getSchools } from "@/lib/features/schools/school-actions";
import { t } from "@/lib/i18n/server";
import AcademicYearForm from "./AcademicYearForm";
import EditAcademicYearButton from "./EditAcademicYearButton";
import DeleteAcademicYearButton from "./DeleteAcademicYearButton";
import EmptyState from "@/components/ui/empty-state";
import DataTable, { DataTableRow, DataTableCell } from "@/components/ui/data-table";

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

  const columns = [
    { key: "name", header: nameLabel, width: "25%" },
    { key: "startDate", header: startDateLabel, width: "20%" },
    { key: "endDate", header: endDateLabel, width: "20%" },
    { key: "current", header: currentLabel, width: "20%" },
    { key: "actions", header: actionsLabel, width: "15%", align: "right" as const },
  ];

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
        <div className="mt-6">
          <DataTable columns={columns}>
            {years.map((year) => (
              <DataTableRow key={year.id}>
                <DataTableCell className="font-medium">{year.name}</DataTableCell>
                <DataTableCell className="text-slate-500">{new Date(year.startDate).toLocaleDateString()}</DataTableCell>
                <DataTableCell className="text-slate-500">{new Date(year.endDate).toLocaleDateString()}</DataTableCell>
                <DataTableCell>
                  {year.isCurrent && (
                    <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                      {currentLabel}
                    </span>
                  )}
                </DataTableCell>
                <DataTableCell align="right">
                  <div className="flex justify-end gap-2">
                    <EditAcademicYearButton id={year.id} currentName={year.name} />
                    <DeleteAcademicYearButton id={year.id} />
                  </div>
                </DataTableCell>
              </DataTableRow>
            ))}
          </DataTable>
        </div>
      )}
    </main>
  );
}
