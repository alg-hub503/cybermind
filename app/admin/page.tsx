import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

 if (session?.user?.role !== "ADMIN") {
  redirect("/dashboard");
}

  return (
    <div style={{ padding: 30 }}>
      <h1>Admin Panel</h1>
      <p>Welcome Admin</p>
    </div>
  );
}