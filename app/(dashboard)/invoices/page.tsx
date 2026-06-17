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

async function getInvoices() {
  const res = await fetch(
    `${process.env.NEXTAUTH_URL}/api/invoices`,
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

  const invoices = await getInvoices();

  return (
    <div style={{ padding: 30 }}>
      <h1>Invoices</h1>

      {Array.isArray(invoices) &&
        invoices.map((invoice: any) => (
          <div key={invoice.id}>
            #{invoice.id} - ${invoice.amount}
          </div>
        ))}
    </div>
  );
}