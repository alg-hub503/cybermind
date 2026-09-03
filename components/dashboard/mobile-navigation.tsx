"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { LogOut, X } from "lucide-react";

import { LanguageSwitcher } from "@/app/_components/language-switcher";
import { useTranslations } from "@/lib/i18n/use-translations";

interface MobileNavigationProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileNavigation({ open, onClose }: MobileNavigationProps) {
  const { data: session } = useSession();
  const { t, locale, dir } = useTranslations("sidebar");

  if (!open) return null;

  const isAdmin = session?.user?.role === "ADMIN";
  const schoolId = session?.user?.schoolId;
  const name = session?.user?.name ?? session?.user?.email?.split("@")[0] ?? "User";
  const base = locale === "en" ? "/en" : locale === "fr" ? "/fr" : "";
  const items = [
    [`${base}/dashboard`, t("dashboard")],
    [`${base}/dashboard/clients`, t("clients")],
    [`${base}/dashboard/invoices`, t("invoices")],
    [`${base}/dashboard/schools`, t("schools")],
    [`${base}/dashboard/academic-years`, t("academicYears")],
    [`${base}/dashboard/grades`, t("grades")],
    [`${base}/dashboard/classes`, t("classes")],
    [`${base}/dashboard/students`, t("students")],
    [`${base}/dashboard/teachers`, t("teachers")],
    [`${base}/dashboard/staff`, t("staff")],
    [`${base}/dashboard/stats`, t("stats")],
    [`${base}/dashboard/subscription`, t("subscription")],
    [`${base}/dashboard/billing`, t("billing")],
    [`${base}/dashboard/hub`, t("hub")],
  ];

  if (!isAdmin && schoolId) {
    items.push([`${base}/dashboard/schools/${schoolId}/settings`, t("settings")]);
  }

  if (isAdmin) {
    items.push(
      [`${base}/dashboard/admin`, t("admin")],
      [`${base}/dashboard/roles`, t("roles")],
      [`${base}/dashboard/platform-settings`, t("platformSettings")],
    );
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden" dir={dir}>
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/50"
        aria-label="Close navigation"
        onClick={onClose}
      />

      <aside className="relative flex h-full w-72 max-w-[85vw] flex-col bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 p-4">
          <div>
            <h1 className="text-xl font-bold text-white">
              Cyber<span className="text-blue-500">Mind</span>
            </h1>
            <p className="mt-1 text-xs text-slate-400">{t("tagline")}</p>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher currentLang={locale} label={locale === "ar" ? "EN" : "AR"} />
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white"
              aria-label="Close navigation"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto p-4" aria-label={t("dashboard")}>
          <div className="flex flex-col gap-2">
            {items.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className="rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
              >
                {label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="border-t border-slate-800 p-4">
          <p className="truncate font-semibold text-white">{name}</p>
          <p className="mt-1 truncate text-sm text-slate-400">{session?.user?.email}</p>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: locale === "en" ? "/en/login" : "/login" })}
            className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            <LogOut size={16} />
            {t("logout")}
          </button>
        </div>
      </aside>
    </div>
  );
}
