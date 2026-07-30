import { requireCurrentUser } from "@/lib/require-current-user";
import { ADMIN_ROLE } from "@/lib/constants";
import { getStudents, getStudentsBySchool } from "@/lib/features/students/student-actions";
import { getSchools } from "@/lib/features/schools/school-actions";
import { t } from "@/lib/i18n/server";
import StudentForm from "./StudentForm";
import EditStudentButton from "./EditStudentButton";
import DeleteStudentButton from "./DeleteStudentButton";
import EmptyState from "@/components/ui/empty-state";

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
        <div className="mt-6 rounded-lg border bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-3 text-left">{codeLabel}</th>
                <th className="p-3 text-left">{nameLabel}</th>
                <th className="p-3 text-left">{statusLabel}</th>
                <th className="p-3 text-right">{actionsLabel}</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-b">
                  <td className="p-3 font-mono text-sm">{student.code}</td>
                  <td className="p-3">{student.firstName} {student.lastName}</td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      student.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}>
                      {student.status === "ACTIVE" ? activeLabel : inactiveLabel}
                    </span>
                  </td>
                  <td className="flex justify-end gap-2 p-3">
                    <EditStudentButton id={student.id} currentFirstName={student.firstName} currentLastName={student.lastName} currentCode={student.code} />
                    <DeleteStudentButton id={student.id} />
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
