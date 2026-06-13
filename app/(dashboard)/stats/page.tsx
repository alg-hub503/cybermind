async function getStats() {
  const res = await fetch(
    "http://localhost:3000/api/stats",
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
    </div>
  );
}