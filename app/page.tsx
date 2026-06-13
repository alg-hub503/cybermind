import Link from "next/link";

export default function Home() {
  return (
    <main
      style={{
        padding: 50,
        textAlign: "center",
      }}
    >
      <h1>🚀 CyberMind SaaS</h1>

      <p>
        Manage schools, clients and invoices from one
        powerful platform.
      </p>

      <div style={{ marginTop: 30 }}>
        <Link href="/pricing">
          <button
            style={{
              padding: "12px 24px",
              marginRight: 10,
            }}
          >
            💰 Pricing
          </button>
        </Link>

        <Link href="/login">
          <button
            style={{
              padding: "12px 24px",
            }}
          >
            🔐 Login
          </button>
        </Link>
      </div>
    </main>
  );
}