import { requireCurrentUser } from "@/lib/require-current-user";
import { ADMIN_ROLE } from "@/lib/constants";
import { getStudents, getStudentsBySchool } from "@/lib/features/students/student-actions";
import { getSchools } from "@/lib/features/schools/school-actions";
import { t } from "@/lib/i18n/server";
import StudentForm from "./StudentForm";
import EditStudentButton from "./EditStudentButton";
import DeleteStudentButton from "./DeleteStudentButton";
import EmptyState from "@/components/ui/empty-state";
import DataTable, { DataTableRow, DataTableCell } from "@/components/ui/data-table";

export default async function StudentsPage() {
  const { user } = await requireCurrentUser();

  const students = user.role === ADMIN_ROLE
    ? await getStudents()
    : user.schoolId
      ? await getStudentsBySchool(user.schoolId)
      : [];

  const isAdmin = user.role === ADMIN_ROLE;

  const title = await t("students.title");
  const description = await t("students.description");
  const codeLabel = await t("students.code");
  const nameLabel = await t("students.name");
  const statusLabel = await t("students.status");
  const actionsLabel = await t("students.actions");
  const activeLabel = await t("students.active");
  const inactiveLabel = await t("students.inactive");
  const noRecords = await t("students.noRecords");
  const emptyDescription = await t("students.emptyDescription");

  const columns = [
    { key: "code", header: codeLabel, width: "10%" },
    { key: "name", header: nameLabel, width: "45%" },
    { key: "status", header: statusLabel, width: "35%" },
    { key: "actions", header: actionsLabel, width: "10%", align: "center" as const },
  ];

  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-gray-500">{description}</p>
      </div>

      {isAdmin ? (
        <StudentForm schools={await getSchools()} />
      ) : user.schoolId ? (
        <StudentForm schoolId={user.schoolId} />
      ) : null}

      {students.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title={noRecords}
            description={emptyDescription}
          />
        </div>
      ) : (
        <div className="mt-6">
          <DataTable columns={columns}>
            {students.map((student) => (
              <DataTableRow key={student.id}>
                <DataTableCell className="font-mono text-sm">{student.code}</DataTableCell>
                <DataTableCell className="font-medium">{student.firstName} {student.lastName}</DataTableCell>
                <DataTableCell>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    student.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  }`}>
                    {student.status === "ACTIVE" ? activeLabel : inactiveLabel}
                  </span>
                </DataTableCell>
                <DataTableCell align="center">
                  <div className="flex justify-center gap-2">
                    <EditStudentButton id={student.id} currentFirstName={student.firstName} currentLastName={student.lastName} currentCode={student.code} />
                    <DeleteStudentButton id={student.id} />
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
