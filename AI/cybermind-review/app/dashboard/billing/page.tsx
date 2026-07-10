import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function BillingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.subscriptionStatus !== "PRO") {
    redirect("/upgrade");
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>Billing</h1>

      <p>Current Plan: PRO</p>

      <Link href="/dashboard">
        Back To Dashboard
      </Link>
    </div>
  );
}