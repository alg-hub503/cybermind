import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { getUserByEmail } from "@/lib/services/user.service";
import { getSchoolStats } from "@/lib/services/stats.service";

export default async function StatsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await getUserByEmail(session.user.email);

  if (!user?.schoolId) {
    return <div>No School Found</div>;
  }

  const {
    clients,
    users,
    invoices,
    revenue,
  } = await getSchoolStats(user.schoolId);

  return (
    <div style={{ padding: 30 }}>
      <h1 style={{ marginBottom: 30 }}>
        Dashboard Statistics
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20,
        }}
      >
        <div
          style={{
            padding: 20,
            border: "1px solid #ddd",
            borderRadius: 10,
          }}
        >
          <h3>Total Clients</h3>
          <h1>{clients}</h1>
        </div>

        <div
          style={{
            padding: 20,
            border: "1px solid #ddd",
            borderRadius: 10,
          }}
        >
          <h3>Total Users</h3>
          <h1>{users}</h1>
        </div>

        <div
          style={{
            padding: 20,
            border: "1px solid #ddd",
            borderRadius: 10,
          }}
        >
          <h3>Total Invoices</h3>
          <h1>{invoices}</h1>
        </div>

        <div
          style={{
            padding: 20,
            border: "1px solid #ddd",
            borderRadius: 10,
          }}
        >
          <h3>Total Revenue</h3>
          <h1>${revenue}</h1>
        </div>
      </div>
    </div>
  );
}