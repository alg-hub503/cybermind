import { redirect } from "next/navigation";

async function getUser() {
  try {
    const res = await fetch("/api/me", { cache: "no-store" });
    return res.json();
  } catch {
    return null;
  }
}

async function getClients() {
  try {
    const res = await fetch("/api/clients", { cache: "no-store" });
    return res.json();
  } catch {
    return [];
  }
}

export default async function Page() {
  const user = await getUser();

  if (!user) return redirect("/login");

  if (user.subscriptionStatus !== "PRO") {
    return redirect("/upgrade");
  }

  const clients = await getClients();

  return (
    <div style={{ padding: 30 }}>
      <h1>Clients</h1>

      {clients?.map((client: any) => (
        <div key={client.id}>{client.name}</div>
      ))}
    </div>
  );
}