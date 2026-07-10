"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SchoolTabsProps {
  schoolId: string;
}

export default function SchoolTabs({
  schoolId,
}: SchoolTabsProps) {
  const pathname = usePathname();

  const tabs = [
    {
      label: "Overview",
      href: `/dashboard/schools/${schoolId}`,
      exact: true,
    },
    {
      label: "Users",
      href: `/dashboard/schools/${schoolId}/users`,
    },
    {
      label: "Clients",
      href: `/dashboard/schools/${schoolId}/clients`,
    },
    {
      label: "Invoices",
      href: `/dashboard/schools/${schoolId}/invoices`,
    },
    {
      label: "Analytics",
      href: `/dashboard/schools/${schoolId}/analytics`,
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