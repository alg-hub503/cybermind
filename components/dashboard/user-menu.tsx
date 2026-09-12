"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

import Button from "@/components/ui/button";
import { useTranslations } from "@/lib/i18n/use-translations";
import { useTrialAccess } from "@/components/dashboard/trial-access-provider";
import { toAccessString } from "@/lib/trial-status";

export default function UserMenu() {
  const { data: session } = useSession();
  const { t, dir } = useTranslations("userMenu");
  const access = useTrialAccess();

  const name = session?.user?.name ?? session?.user?.email?.split("@")[0] ?? "Guest";
  const email = session?.user?.email ?? "No email";
  const role = session?.user?.role ?? "USER";
  const subscription = access ? toAccessString(access) : "...";
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm sm:gap-3 sm:px-4 sm:py-2" dir={dir}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white sm:h-10 sm:w-10">
        {initial}
      </div>

      <div className="hidden md:block">
        <p className="text-sm font-semibold text-slate-900">{name}</p>
        <p className="text-xs text-slate-500">{email}</p>
        <div className="mt-1 flex gap-2">
          <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">{role}</span>
          <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">{subscription}</span>
        </div>
      </div>

      <Link href="/dashboard/profile" className="hidden text-sm font-medium text-indigo-600 hover:text-indigo-700 sm:inline">
        {t("profile.title")}
      </Link>

      <Button variant="outline" className="hidden sm:inline-flex" onClick={() => signOut({ callbackUrl: "/login" })}>
        {t("logout")}
      </Button>
    </div>
  );
}
