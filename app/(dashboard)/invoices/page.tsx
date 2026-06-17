import { redirect } from "next/navigation";

async function getUser() {
  try {
    const res = await fetch("/api/me", { cache: "no-store" });
    return res.json();
  } catch {
    return null;
  }
}

async function getInvoices() {
  try {
    const res = await fetch("/api/invoices", { cache: "no-store" });
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

  const invoices = await getInvoices();

  return (
    <div style={{ padding: 30 }}>
      <h1>Invoices</h1>

      {invoices?.map((invoice: any) => (
        <div key={invoice.id}>
          #{invoice.id} - ${invoice.amount}
        </div>
      ))}
    </div>
  );
}