import Link from "next/link";

export default function DashboardLayout({
children,
}: {
children: React.ReactNode;
}) {
return (
<div style={{ display: "flex", height: "100vh" }}>
<aside
style={{
width: "220px",
background: "#111",
color: "#fff",
padding: "20px",
}}
> <h2>CyberMind</h2>

```
    <nav>
      <ul style={{ listStyle: "none", padding: 0 }}>
        <li><Link href="/dashboard">Dashboard</Link></li>
        <li><Link href="/dashboard/clients">Clients</Link></li>
        <li><Link href="/dashboard/invoices">Invoices</Link></li>
        <li><Link href="/dashboard/schools">Schools</Link></li>
        <li><Link href="/dashboard/stats">Stats</Link></li>
        <li><Link href="/dashboard/subscription">Subscription</Link></li>
        <li><Link href="/dashboard/billing">Billing</Link></li>
      </ul>
    </nav>
  </aside>

  <main style={{ flex: 1, padding: "20px" }}>
    {children}
  </main>
</div>
```

);
}
