import { requireCurrentUser } from "@/lib/require-current-user";
import { ADMIN_ROLE } from "@/lib/constants";
import { getSchools, getSchool } from "@/lib/features/schools/school-actions";
import { t } from "@/lib/i18n/server";
import Link from "next/link";
import SchoolForm from "./SchoolForm";
import EditSchoolButton from "./EditSchoolButton";
import DeleteSchoolButton from "./DeleteSchoolButton";
import DataTable, { DataTableRow, DataTableCell } from "@/components/ui/data-table";

export default async function SchoolsPage() {
  const { user } = await requireCurrentUser();

  const schools = user.role === ADMIN_ROLE
    ? await getSchools()
    : user.schoolId
      ? await (async () => { const s = await getSchool(user.schoolId!); return s ? [s] : []; })()
      : [];

  const title = await t("schools.title");
  const description = await t("schools.description");
  const nameLabel = await t("schools.name");
  const actionsLabel = await t("schools.actions");

  const isAdmin = user.role === ADMIN_ROLE;

  const columns = isAdmin
    ? [
        { key: "name", header: nameLabel, width: "85%" },
        { key: "actions", header: actionsLabel, width: "15%", align: "right" as const },
      ]
    : [
        { key: "name", header: nameLabel, width: "100%" },
      ];

  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-gray-500">{description}</p>
      </div>

      {isAdmin && <SchoolForm />}

      <div className="mt-6">
        <DataTable columns={columns}>
          {schools.map((school) => (
            <DataTableRow key={school.id}>
              <DataTableCell>
                <Link
                  href={`/dashboard/schools/${school.id}`}
                  className="font-medium text-indigo-600 hover:underline"
                >
                  {school.name}
                </Link>
              </DataTableCell>
              {isAdmin && (
                <DataTableCell align="right">
                  <div className="flex justify-end gap-2">
                    <EditSchoolButton id={school.id} currentName={school.name} />
                    <DeleteSchoolButton id={school.id} />
                  </div>
                </DataTableCell>
              )}
            </DataTableRow>
          ))}
        </DataTable>
      </div>
    </main>
  );
}
