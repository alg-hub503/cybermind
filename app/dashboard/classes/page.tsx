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
import DataTable, { DataTableRow, DataTableCell } from "@/components/ui/data-table";

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

  const columns = [
    { key: "name", header: nameLabel, width: "50%" },
    { key: "code", header: codeLabel, width: "35%" },
    { key: "actions", header: actionsLabel, width: "15%", align: "right" as const },
  ];

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
        <div className="mt-6">
          <DataTable columns={columns}>
            {classes.map((classe) => (
              <DataTableRow key={classe.id}>
                <DataTableCell className="font-medium">{classe.name}</DataTableCell>
                <DataTableCell className="text-slate-500">{classe.code}</DataTableCell>
                <DataTableCell align="right">
                  <div className="flex justify-end gap-2">
                    <EditClassButton id={classe.id} currentName={classe.name} currentCode={classe.code} />
                    <DeleteClassButton id={classe.id} />
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
