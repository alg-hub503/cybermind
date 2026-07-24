import { requireAdmin } from "@/lib/auth/require-admin";
import { getUsers } from "@/lib/services/user.service";

import RoleButton from "@/components/RoleButton";

interface AdminPageProps {
  searchParams: Promise<{
    search?: string;
  }>;
}

export default async function AdminPage({
  searchParams,
}: AdminPageProps) {
  await requireAdmin();

  const params = await searchParams;

  const search = params.search ?? "";

  const users = await getUsers(search);

  return (
    <div style={{ padding: 30 }}>
      <h1>Admin Users Management</h1>

      <table
        border={1}
        cellPadding={10}
        style={{
          marginTop: 20,
          borderCollapse: "collapse",
          width: "100%",
        }}
      >
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Subscription</th>
            <th>Role Action</th>
            
          </tr>
        </thead>

        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={4}>
                No users found.
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>

                <td>{user.role}</td>

                <td>
                  {user.School?.subscription?.status ?? "N/A"}
                </td>

                <td>
                  <RoleButton
                    userId={user.id}
                    role={user.role}
                  />
                </td>

              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}