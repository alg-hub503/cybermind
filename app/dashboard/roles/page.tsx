import { requireCurrentUser } from "@/lib/require-current-user";
import { getRolesBySchoolId } from "@/lib/features/roles/role-actions";
import { t } from "@/lib/i18n/server";
import EmptyState from "@/components/ui/empty-state";
import DataTable, { DataTableRow, DataTableCell } from "@/components/ui/data-table";

export default async function RolesPage() {
  const { user } = await requireCurrentUser();

  if (!user.schoolId) {
    return (
      <main className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-gray-500">You do not have a school assigned.</p>
        </div>
      </main>
    );
  }

  const roles = await getRolesBySchoolId(user.schoolId);

  const title = await t("roles.title");
  const description = await t("roles.description");
  const nameLabel = await t("roles.name");
  const descriptionLabel = await t("roles.descriptionLabel");
  const permissionsLabel = await t("roles.permissions");
  const defaultLabel = await t("roles.default");
  const noRecords = await t("roles.noRecords");
  const emptyDescription = await t("roles.emptyDescription");

  const columns = [
    { key: "name", header: nameLabel, width: "20%" },
    { key: "description", header: descriptionLabel, width: "30%" },
    { key: "permissions", header: permissionsLabel, width: "35%" },
    { key: "default", header: defaultLabel, width: "15%", align: "center" as const },
  ];

  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-gray-500">{description}</p>
      </div>

      {roles.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title={noRecords}
            description={emptyDescription}
          />
        </div>
      ) : (
        <div className="mt-6">
          <DataTable columns={columns}>
            {roles.map((role) => (
              <DataTableRow key={role.id}>
                <DataTableCell className="font-medium">{role.name}</DataTableCell>
                <DataTableCell>{role.description ?? "—"}</DataTableCell>
                <DataTableCell>
                  <div className="flex flex-wrap gap-1">
                    {role.RolePermission.map((rp) => (
                      <span
                        key={rp.permission.id}
                        className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700"
                      >
                        {rp.permission.code}
                      </span>
                    ))}
                  </div>
                </DataTableCell>
                <DataTableCell align="center">
                  {role.isDefault && (
                    <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      {defaultLabel}
                    </span>
                  )}
                </DataTableCell>
              </DataTableRow>
            ))}
          </DataTable>
        </div>
      )}
    </main>
  );
}
