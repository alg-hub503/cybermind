import { requireCurrentUser } from "@/lib/require-current-user";
import { ADMIN_ROLE } from "@/lib/constants";
import { getStudents, getStudentsBySchool } from "@/lib/features/students/student-actions";
import { getSchools } from "@/lib/features/schools/school-actions";
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

  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Students</h1>
        <p className="text-gray-500">Manage student records</p>
      </div>

      {isAdmin ? (
        <StudentForm schools={await getSchools()} />
      ) : user.schoolId ? (
        <StudentForm schoolId={user.schoolId} />
      ) : null}

      {students.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No students yet"
            description="Enroll your first student to get started."
          />
        </div>
      ) : (
        <div className="mt-6 rounded-lg border bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-3 text-left">Code</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-right">Actions</th>
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
                      {student.status}
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
