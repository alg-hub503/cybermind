import { getUsers } from "@/lib/services/user.service";

import SubscriptionButton from "@/components/SubscriptionButton";
import RoleButton from "@/components/RoleButton";

import DeleteUserButton from "./DeleteUserButton";

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div style={{ padding: 30 }}>
      <h1>Users</h1>

      <table
        border={1}
        cellPadding={10}
        style={{
          borderCollapse: "collapse",
          width: "100%",
          marginTop: 20,
        }}
      >
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Subscription</th>
            <th>Subscription Action</th>
            <th>Role Action</th>
            <th>Delete</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.email}</td>

              <td>{user.role}</td>

              <td>{user.subscriptionStatus}</td>

              <td>
                <SubscriptionButton
                  userId={user.id}
                  subscriptionStatus={user.subscriptionStatus}
                />
              </td>

              <td>
                <RoleButton
                  userId={user.id}
                  role={user.role}
                />
              </td>

              <td>
                <DeleteUserButton id={user.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}