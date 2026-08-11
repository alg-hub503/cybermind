import { requireCurrentUser } from "@/lib/require-current-user";
import { ADMIN_ROLE } from "@/lib/constants";
import { getTeachers, getTeachersBySchool } from "@/lib/features/teachers/teacher-actions";
import { getSchools } from "@/lib/features/schools/school-actions";
import { t } from "@/lib/i18n/server";
import TeacherForm from "./TeacherForm";
import EmptyState from "@/components/ui/empty-state";
import DataTable, { DataTableRow, DataTableCell } from "@/components/ui/data-table";

export default async function TeachersPage() {
  const { user } = await requireCurrentUser();

  const teachers = user.role === ADMIN_ROLE
    ? await getTeachers()
    : user.schoolId
      ? await getTeachersBySchool(user.schoolId)
      : [];

  const isAdmin = user.role === ADMIN_ROLE;

  const title = await t("teachers.title");
  const description = await t("teachers.description");
  const nameLabel = await t("teachers.name");
  const emailLabel = await t("teachers.email");
  const specializationLabel = await t("teachers.specialization");
  const statusLabel = await t("teachers.status");
  const actionsLabel = await t("teachers.actions");
  const activeLabel = await t("teachers.active");
  const inactiveLabel = await t("teachers.inactive");
  const noRecords = await t("teachers.noRecords");
  const emptyDescription = await t("teachers.emptyDescription");

  const columns = [
    { key: "name", header: nameLabel, width: "25%" },
    { key: "email", header: emailLabel, width: "25%" },
    { key: "specialization", header: specializationLabel, width: "25%" },
    { key: "status", header: statusLabel, width: "15%" },
    { key: "actions", header: actionsLabel, width: "10%", align: "center" as const },
  ];

  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-gray-500">{description}</p>
      </div>

      {isAdmin ? (
        <TeacherForm schools={await getSchools()} />
      ) : user.schoolId ? (
        <TeacherForm schoolId={user.schoolId} />
      ) : null}

      {teachers.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title={noRecords}
            description={emptyDescription}
          />
        </div>
      ) : (
        <div className="mt-6">
          <DataTable columns={columns}>
            {teachers.map((teacher) => (
              <DataTableRow key={teacher.id}>
                <DataTableCell className="font-medium">{teacher.user.name ?? "—"}</DataTableCell>
                <DataTableCell>{teacher.user.email}</DataTableCell>
                <DataTableCell>{teacher.specialization ?? "—"}</DataTableCell>
                <DataTableCell>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    teacher.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  }`}>
                    {teacher.status === "ACTIVE" ? activeLabel : inactiveLabel}
                  </span>
                </DataTableCell>
                <DataTableCell align="center">
                  <div className="flex justify-center gap-2">
                    <a
                      href={`/dashboard/teachers/${teacher.id}`}
                      className="rounded-lg border border-slate-300 px-3 py-1 text-sm hover:bg-slate-50"
                    >
                      {actionsLabel}
                    </a>
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
