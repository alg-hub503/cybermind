async function getUsers() {
  const res = await fetch(
    "http://localhost:3000/api/users",
    {
      cache: "no-store",
    }
  );

  return res.json();
}

export default async function Page() {
  const users = await getUsers();

  return (
    <div style={{ padding: 30 }}>
      <h1>Manage Users</h1>

      {users.map((user: any) => (
        <div key={user.id}>
          {user.email} - {user.role}
        </div>
      ))}
    </div>
  );
}