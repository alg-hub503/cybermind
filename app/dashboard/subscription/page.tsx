import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return (
      <div style={{ padding: 30 }}>
        <h1>Unauthorized</h1>
      </div>
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  });

  return (
    <div style={{ padding: 30 }}>
      <h1>Subscription</h1>

      <h2>
        Current Plan: {user?.subscriptionStatus}
      </h2>

      <pre style={{ marginTop: 30 }}>
        {JSON.stringify(user, null, 2)}
      </pre>
    </div>
  );
}