import { redirect } from "next/navigation";

async function getUser() {
  const res = await fetch(
    `${process.env.NEXTAUTH_URL}/api/me`,
    {
      cache: "no-store",
    }
  );

  return res.json();
}

async function getClients() {
  const res = await fetch(
    `${process.env.NEXTAUTH_URL}/api/clients`,
    {
      cache: "no-store",
    }
  );

  return res.json();
}

export default async function Page() {
  const user = await getUser();

  if (!user || user.subscriptionStatus !== "PRO") {
    redirect("/upgrade");
  }

  const clients = await getClients();

  return (
    <div style={{ padding: 30 }}>
      <h1>Clients</h1>

      {Array.isArray(clients) &&
        clients.map((client: any) => (
          <div key={client.id}>
            {client.name}
          </div>
        ))}
    </div>
  );
}