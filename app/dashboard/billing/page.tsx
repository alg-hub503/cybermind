import { requireCurrentUser } from "@/lib/require-current-user";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function BillingPage() {
  const { user } = await requireCurrentUser();

  if (!user.schoolId) {
    redirect("/schools");
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>Billing</h1>

      <p>School ID: {user.schoolId}</p>

      <Link href="/dashboard">
        Back To Dashboard
      </Link>
    </div>
  );
}
