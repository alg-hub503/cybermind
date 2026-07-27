import { requireCurrentUser } from "@/lib/require-current-user";
import { ADMIN_ROLE } from "@/lib/constants";
import { getAcademicYears, getAcademicYearsBySchool } from "@/lib/features/academic-years/academic-year-actions";
import { getSchools } from "@/lib/features/schools/school-actions";
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

  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Academic Years</h1>
        <p className="text-gray-500">Manage academic years for your institution</p>
      </div>

      {isAdmin ? (
        <AcademicYearForm schools={await getSchools()} />
      ) : user.schoolId ? (
        <AcademicYearForm schoolId={user.schoolId} />
      ) : null}

      {years.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No academic years yet"
            description="Create your first academic year to get started."
          />
        </div>
      ) : (
        <div className="mt-6 rounded-lg border bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Start Date</th>
                <th className="p-3 text-left">End Date</th>
                <th className="p-3 text-left">Current</th>
                <th className="p-3 text-right">Actions</th>
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
                        Current
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
