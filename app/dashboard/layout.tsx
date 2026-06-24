import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex" }}>
      <aside
        style={{
          width: "250px",
          padding: "20px",
          borderRight: "1px solid #ddd",
          minHeight: "100vh",
        }}
      >
        <h2>CyberMind</h2>

        <ul style={{ listStyle: "none", padding: 0 }}>
          <li><Link href="/dashboard">Dashboard</Link></li>
          <li><Link href="/clients">Clients</Link></li>
          <li><Link href="/invoices">Invoices</Link></li>
          <li><Link href="/schools">Schools</Link></li>
          <li><Link href="/stats">Stats</Link></li>
          <li><Link href="/subscription">Subscription</Link></li>
          <li><Link href="/billing">Billing</Link></li>
        </ul>
      </aside>

      <main style={{ flex: 1, padding: "20px" }}>
        {children}
      </main>
    </div>
  );
}