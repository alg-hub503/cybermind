async function getStats() {
  const res = await fetch(
    "http://localhost:3000/api/stats",
    {
      cache: "no-store",
    }
  );

  return res.json();
}

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div>
      <h1>Dashboard</h1>

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        <div
          style={{
            padding: "20px",
            border: "1px solid #ddd",
          }}
        >
          <h3>Clients</h3>
          <p>{stats.clients}</p>
        </div>

        <div
          style={{
            padding: "20px",
            border: "1px solid #ddd",
          }}
        >
          <h3>Plan</h3>
          <p>FREE / PRO</p>
        </div>
      </div>
    </div>
  );
}