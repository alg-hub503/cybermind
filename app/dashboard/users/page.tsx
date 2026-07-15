import { requireCurrentUser } from "@/lib/require-current-user";
import { redirect } from "next/navigation";
import { getUsers } from "@/lib/services/user.service";

import {
  DataTable,
  DataTableToolbar,
} from "@/components/ui/data-table";

import {
  columns,
  UserRow,
} from "@/components/tables/users/columns";

export default async function UsersPage() {

  const { user } = await requireCurrentUser();

  if (!user.schoolId) {
    redirect("/schools");
  }
  const users = await getUsers();

  const data: UserRow[] = users.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    subscriptionStatus: user.subscriptionStatus,
  }));

  return (
    <div className="space-y-6">
      <DataTableToolbar
        title="Users"
        description="Manage all registered users."
      />

      <DataTable
        columns={columns}
        data={data}
      />
    </div>
  );
}


