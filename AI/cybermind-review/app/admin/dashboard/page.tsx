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

export default async function Page() {
  const user = await getUser();

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>Admin Dashboard</h1>
    </div>
  );
}