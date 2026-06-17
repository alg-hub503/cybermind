async function getUser() {
  try {
    const res = await fetch("/api/me", { cache: "no-store" });
    return res.json();
  } catch {
    return null;
  }
}

export default async function Page() {
  const user = await getUser();

  if (!user) return <div>Not logged in</div>;

  return (
    <div style={{ padding: 30 }}>
      <h1>Subscription</h1>
      <h2>Current Plan: {user.subscriptionStatus}</h2>
    </div>
  );
}