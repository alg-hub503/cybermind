"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewUserPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"USER" | "ADMIN">("USER");

  async function handleSubmit(
  e: React.FormEvent<HTMLFormElement>
) {
  e.preventDefault();

  const schoolId =
    window.location.pathname.split("/")[3];

  const { createSchoolUser } = await import(
    "@/lib/actions/school-user-actions"
  );

  await createSchoolUser({
  schoolId,
  name,
  email,
  password,
  role,
});

  router.push(
    `/dashboard/schools/${schoolId}/users`
  );

  router.refresh();
}
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="mb-6 text-2xl font-bold">Add User</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium">Name</label>

          <input
            className="w-full rounded-xl border p-3"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Email</label>

          <input
            type="email"
            className="w-full rounded-xl border p-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Password</label>

          <input
            type="password"
            className="w-full rounded-xl border p-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
<div>
  <label className="mb-2 block text-sm font-medium">
    Role
  </label>

  <select
    className="w-full rounded-xl border p-3"
    value={role}
    onChange={(e) =>
      setRole(e.target.value as "USER" | "ADMIN")
    }
  >
    <option value="USER">
      USER
    </option>

    <option value="ADMIN">
      ADMIN
    </option>
  </select>
</div>
        <button
          type="submit"
          className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white"
        >
          Create User
        </button>
      </form>
    </div>
  );
}
