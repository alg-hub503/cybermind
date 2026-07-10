interface User {
  id: string;
  email: string;
  role: string;
}

async function getUsers(): Promise<User[]> {
  const res = await fetch(
    "http://localhost:3000/api/users",
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }

  return res.json();
}

export default async function Page() {
  const users = await getUsers();

  return (
    <div style={{ padding: 30 }}>
      <h1>Manage Users</h1>

      {users.map((user) => (
        <div key={user.id}>
          {user.email} - {user.role}
        </div>
      ))}
    </div>
  );
}