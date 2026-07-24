"use client";

import { signOut, useSession } from "next-auth/react";

import Button from "@/components/ui/button";

export default function UserMenu() {
  const { data: session } = useSession();

  const name =
    session?.user?.name ??
    session?.user?.email?.split("@")[0] ??
    "Guest";

  const email = session?.user?.email ?? "No email";

  const role = session?.user?.role ?? "USER";

  const subscription =
    session?.user?.subscriptionStatus ?? "TRIAL";

  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white">
        {initial}
      </div>

      <div className="hidden md:block">
        <p className="text-sm font-semibold text-slate-900">
          {name}
        </p>

        <p className="text-xs text-slate-500">
          {email}
        </p>

        <div className="mt-1 flex gap-2">
          <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
            {role}
          </span>

          <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
            {subscription}
          </span>
        </div>
      </div>

      <Button
        variant="outline"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        Logout
      </Button>
    </div>
  );
}