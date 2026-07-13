import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { updateUser } from "@/lib/actions/user-actions";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditUserPage({
  params,
}: PageProps) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">
          User not found
        </h1>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="mb-6 text-3xl font-bold">
        Edit User
      </h1>

      <form
        action={async (formData) => {
          "use server";

          await updateUser({
            id: user.id,
            name: String(formData.get("name")),
            email: String(formData.get("email")),
            role: formData.get("role") as "USER" | "ADMIN",
          });
        }}
        className="space-y-4"
      >
        <div>
          <label className="font-semibold">
            Name
          </label>

          <input
            name="name"
            defaultValue={user.name ?? ""}
            className="mt-2 w-full rounded-xl border p-3"
          />
        </div>

        <div>
          <label className="font-semibold">
            Email
          </label>

          <input
            name="email"
            defaultValue={user.email}
            className="mt-2 w-full rounded-xl border p-3"
          />
        </div>

        <div>
          <label className="font-semibold">
            Role
          </label>

          <select
            name="role"
            defaultValue={user.role}
            className="mt-2 w-full rounded-xl border p-3"
          >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white"
          >
            Save Changes
          </button>

          <Link
            href="/dashboard/users"
            className="rounded-xl border px-5 py-3"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
