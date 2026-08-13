import { requireCurrentUser } from "@/lib/require-current-user";
import { ADMIN_ROLE } from "@/lib/constants";
import { getStaff, getStaffBySchool } from "@/lib/features/staff/staff-actions";
import { getSchools } from "@/lib/features/schools/school-actions";
import { t } from "@/lib/i18n/server";
import StaffForm from "./StaffForm";
import EditStaffButton from "./EditStaffButton";
import EmptyState from "@/components/ui/empty-state";
import DataTable, { DataTableRow, DataTableCell } from "@/components/ui/data-table";

export default async function StaffPage() {
  const { user } = await requireCurrentUser();

  const staff = user.role === ADMIN_ROLE
    ? await getStaff()
    : user.schoolId
      ? await getStaffBySchool(user.schoolId)
      : [];

  const isAdmin = user.role === ADMIN_ROLE;

  const title = await t("staff.title");
  const description = await t("staff.description");
  const nameLabel = await t("staff.name");
  const emailLabel = await t("staff.email");
  const positionLabel = await t("staff.position");
  const departmentLabel = await t("staff.department");
  const statusLabel = await t("staff.status");
  const actionsLabel = await t("staff.actions");
  const activeLabel = await t("staff.active");
  const inactiveLabel = await t("staff.inactive");
  const noRecords = await t("staff.noRecords");
  const emptyDescription = await t("staff.emptyDescription");

  const columns = [
    { key: "name", header: nameLabel, width: "20%" },
    { key: "email", header: emailLabel, width: "20%" },
    { key: "position", header: positionLabel, width: "20%" },
    { key: "department", header: departmentLabel, width: "20%" },
    { key: "status", header: statusLabel, width: "10%" },
    { key: "actions", header: actionsLabel, width: "10%", align: "center" as const },
  ];

  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-gray-500">{description}</p>
      </div>

      {isAdmin ? (
        <StaffForm schools={await getSchools()} />
      ) : user.schoolId ? (
        <StaffForm schoolId={user.schoolId} />
      ) : null}

      {staff.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title={noRecords}
            description={emptyDescription}
          />
        </div>
      ) : (
        <div className="mt-6">
          <DataTable columns={columns}>
            {staff.map((member) => (
              <DataTableRow key={member.id}>
                <DataTableCell className="font-medium">{member.user.name ?? "—"}</DataTableCell>
                <DataTableCell>{member.user.email}</DataTableCell>
                <DataTableCell>{member.position ?? "—"}</DataTableCell>
                <DataTableCell>{member.department ?? "—"}</DataTableCell>
                <DataTableCell>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    member.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  }`}>
                    {member.status === "ACTIVE" ? activeLabel : inactiveLabel}
                  </span>
                </DataTableCell>
                <DataTableCell align="center">
                  <div className="flex justify-center gap-2">
                    <EditStaffButton
                      id={member.id}
                      currentName={member.user.name ?? ""}
                      currentPhone={member.phone}
                      currentPosition={member.position}
                      currentDepartment={member.department}
                      currentHireDate={member.hireDate ? new Date(member.hireDate).toISOString().split("T")[0] : null}
                    />
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
