import { requireAdmin } from "@/lib/auth/require-admin";
import { getUsers } from "@/lib/services/user.service";

import RoleButton from "@/components/RoleButton";
import SubscriptionButton from "@/components/SubscriptionButton";

export default async function AdminPage() {
  await requireAdmin();

  const users = await getUsers();

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
            <th>Subscription Action</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.email}</td>

              <td>{user.role}</td>

              <td>{user.subscriptionStatus}</td>

              <td>
                <RoleButton
                  userId={user.id}
                  role={user.role}
                />
              </td>

              <td>
                <SubscriptionButton
                  userId={user.id}
                  subscriptionStatus={user.subscriptionStatus}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}