import { requireCurrentUser } from "@/lib/require-current-user";
import { ADMIN_ROLE } from "@/lib/constants";
import { getSchools, getSchool } from "@/lib/features/schools/school-actions";
import { t } from "@/lib/i18n/server";
import SchoolForm from "./SchoolForm";
import SchoolsList from "./SchoolsList";

export default async function SchoolsPage() {
  const { user } = await requireCurrentUser();

  const isAdmin = user.role === ADMIN_ROLE;

  const schools = isAdmin
    ? await getSchools()
    : user.schoolId
      ? await (async () => { const s = await getSchool(user.schoolId!); return s ? [s] : []; })()
      : [];

  const title = await t("schools.title");
  const description = await t("schools.description");
  const noRecords = await t("schools.noRecords");
  const emptyDescription = await t("schools.emptyDescription");

  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-gray-500">{description}</p>
      </div>

      {isAdmin && <SchoolForm />}

      <div className="mt-6">
        <SchoolsList
          schools={schools}
          isAdmin={isAdmin}
          emptyTitle={noRecords}
          emptyDescription={emptyDescription}
        />
      </div>
    </main>
  );
}
