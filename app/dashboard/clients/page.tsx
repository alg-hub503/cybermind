import ClientForm from "./ClientForm";
import DeleteClientButton from "./DeleteClientButton";
import EditClientButton from "./EditClientButton";

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getUser(session: any) {
  if (!session?.user?.email) return null;

  return prisma.user.findUnique({
    where: { email: session.user.email },
  });
}

async function getClients(user: any) {
  return prisma.client.findMany({
    where: {
      schoolId: user.schoolId,
    },
  });
}

export default async function Page() {
  const session = await getServerSession(authOptions);
  const user = await getUser(session);

  if (!user || user.subscriptionStatus !== "PRO") {
    redirect("/upgrade");
  }

  const clients = await getClients(user);

  return (
    <div style={{ padding: 30 }}>
      <h1>Clients</h1>

      <ClientForm />

      {clients.map((client: any) => (
        <div
          key={client.id}
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 10,
            alignItems: "center",
          }}
        >
          <span>{client.name}</span>

          <EditClientButton
            id={client.id}
            currentName={client.name}
          />

          <DeleteClientButton id={client.id} />
        </div>
      ))}
    </div>
  );
}