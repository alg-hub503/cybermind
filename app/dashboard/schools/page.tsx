import { requireCurrentUser } from "@/lib/require-current-user";
import { ADMIN_ROLE } from "@/lib/constants";
import { getSchools, getSchool } from "@/lib/features/schools/school-actions";
import SchoolForm from "./SchoolForm";
import EditSchoolButton from "./EditSchoolButton";
import DeleteSchoolButton from "./DeleteSchoolButton";

export default async function SchoolsPage() {
  const { user } = await requireCurrentUser();

  const schools = user.role === ADMIN_ROLE
    ? await getSchools()
    : user.schoolId
      ? await (async () => { const s = await getSchool(user.schoolId!); return s ? [s] : []; })()
      : [];

  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Schools</h1>
        <p className="text-gray-500">Manage schools</p>
      </div>

      {user.role === ADMIN_ROLE && <SchoolForm />}

      <div className="rounded-lg border bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-3 text-left">Name</th>
              {user.role === ADMIN_ROLE && <th className="p-3 text-right">Actions</th>}
            </tr>
          </thead>

          <tbody>
            {schools.map((school) => (
              <tr key={school.id} className="border-b">
                <td className="p-3">{school.name}</td>
                {user.role === ADMIN_ROLE && (
                  <td className="flex justify-end gap-2 p-3">
                    <EditSchoolButton id={school.id} currentName={school.name} />
                    <DeleteSchoolButton id={school.id} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
