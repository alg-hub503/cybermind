async function getStats() {
  try {
    const res = await fetch("/api/stats", { cache: "no-store" });
    return res.json();
  } catch {
    return { clients: 0 };
  }
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