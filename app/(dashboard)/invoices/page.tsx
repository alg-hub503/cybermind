import { redirect } from "next/navigation";

async function getUser() {
  const res = await fetch(
    "http://localhost:3000/api/me",
    {
      cache: "no-store",
    }
  );

  return res.json();
}

async function getInvoices() {
  const res = await fetch(
    "http://localhost:3000/api/invoices",
    {
      cache: "no-store",
    }
  );

  return res.json();
}

export default async function Page() {
  const user = await getUser();

  if (user.subscriptionStatus !== "PRO") {
    redirect("/upgrade");
  }

  const invoices = await getInvoices();

  return (
    <div style={{ padding: 30 }}>
      <h1>Invoices</h1>

      {invoices.map((invoice: any) => (
        <div key={invoice.id}>
          #{invoice.id} - ${invoice.amount}
        </div>
      ))}
    </div>
  );
}