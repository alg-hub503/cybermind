import Link from "next/link";

export default function Page() {
  return (
    <div style={{ padding: 30 }}>
      <h1>Billing</h1>

      <p>Current Plan: FREE</p>

      <Link href="/upgrade">
        Upgrade To PRO
      </Link>
    </div>
  );
}