async function getStats() {
  const res = await fetch(
    `${process.env.NEXTAUTH_URL}/api/stats`,
    {
      cache: "no-store",
    }
  );

  return res.json();
}

export default async function Page() {
  const stats = await getStats();

  return (
    <div style={{ padding: 30 }}>
      <h1>Statistics</h1>

      <p>Total Clients: {stats.clients}</p>
      <p>Total Schools: {stats.schools}</p>
      <p>Total Users: {stats.users}</p>
    </div>
  );
}