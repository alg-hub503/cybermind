"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "@/lib/i18n/use-translations";

interface SchoolTabsProps {
  schoolId: string;
}

export default function SchoolTabs({
  schoolId,
}: SchoolTabsProps) {
  const pathname = usePathname();
  const { t } = useTranslations("schoolTabs");

  const tabs = [
    {
      label: t("overview"),
      href: `/dashboard/schools/${schoolId}`,
      exact: true,
    },
    {
      label: t("users"),
      href: `/dashboard/schools/${schoolId}/users`,
    },
    {
      label: t("clients"),
      href: `/dashboard/schools/${schoolId}/clients`,
    },
    {
      label: t("invoices"),
      href: `/dashboard/schools/${schoolId}/invoices`,
    },
    {
      label: t("analytics"),
      href: `/dashboard/schools/${schoolId}/analytics`,
    },
    {
      label: t("settings"),
      href: `/dashboard/schools/${schoolId}/settings`,
    },
  ];

  return (
    <div className="border-b border-slate-200">
      <nav className="flex gap-8 overflow-x-auto">
        {tabs.map((tab) => {
          const active = tab.exact
            ? pathname === tab.href
            : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`border-b-2 px-1 py-3 text-sm font-medium transition ${
                active
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}