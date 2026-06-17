async function getUser() {
  const res = await fetch(
    `${process.env.NEXTAUTH_URL}/api/me`,
    {
      cache: "no-store",
    }
  );

  return res.json();
}

export default async function Page() {
  const user = await getUser();

  return (
    <div style={{ padding: 30 }}>
      <h1>Subscription</h1>

      <h2>
        Current Plan: {user?.subscriptionStatus ?? "FREE"}
      </h2>
    </div>
  );
}