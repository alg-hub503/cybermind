import { Suspense } from "react";
import { requireCurrentUser } from "@/lib/require-current-user";
import { ADMIN_ROLE } from "@/lib/constants";
import { getRolesBySchoolId } from "@/lib/features/roles/role-actions";
import { getSchools } from "@/lib/features/schools/school-actions";
import { t } from "@/lib/i18n/server";
import EmptyState from "@/components/ui/empty-state";
import DataTable, { DataTableRow, DataTableCell } from "@/components/ui/data-table";
import SchoolRoleSelector from "./SchoolRoleSelector";

interface RolesContentProps {
  searchParams: Promise<{ schoolId?: string }>;
}

async function RolesContent({ searchParams }: RolesContentProps) {
  const { user } = await requireCurrentUser();
  const params = await searchParams;
  const isPlatformAdmin = user.role === ADMIN_ROLE;

  let schoolId: string | null = null;
  let schools: { id: string; name: string }[] = [];

  if (isPlatformAdmin && !user.schoolId) {
    schools = await getSchools();
    schoolId = params.schoolId ?? null;
  } else if (user.schoolId) {
    schoolId = user.schoolId;
  }

  if (!schoolId) {
    const title = await t("roles.title");
    const selectLabel = await t("roles.selectSchool");
    const noRecords = await t("roles.noRecords");

    return (
      <main className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>

        {isPlatformAdmin && schools.length > 0 && (
          <SchoolRoleSelector
            schools={schools}
            selectedSchoolId={null}
            selectSchoolLabel={selectLabel}
          />
        )}

        {!isPlatformAdmin && (
          <EmptyState
            title={noRecords}
            description="You do not have a school assigned."
          />
        )}
      </main>
    );
  }

  const roles = await getRolesBySchoolId(schoolId);

  const title = await t("roles.title");
  const description = await t("roles.description");
  const nameLabel = await t("roles.name");
  const descriptionLabel = await t("roles.descriptionLabel");
  const permissionsLabel = await t("roles.permissions");
  const defaultLabel = await t("roles.default");
  const noRecords = await t("roles.noRecords");
  const emptyDescription = await t("roles.emptyDescription");
  const selectLabel = await t("roles.selectSchool");

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

      {isPlatformAdmin && schools.length > 0 && (
        <SchoolRoleSelector
          schools={schools}
          selectedSchoolId={schoolId}
          selectSchoolLabel={selectLabel}
        />
      )}

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

export default async function RolesPage({
  searchParams,
}: {
  searchParams: Promise<{ schoolId?: string }>;
}) {
  return (
    <Suspense>
      <RolesContent searchParams={searchParams} />
    </Suspense>
  );
}
