"use client";

import { Bell } from "lucide-react";
import { usePathname } from "next/navigation";

import Button from "@/components/ui/button";
import UserMenu from "@/components/dashboard/user-menu";

export default function Navbar() {
  const pathname = usePathname();

  const titles: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/dashboard/users": "Users",
    "/dashboard/clients": "Clients",
    "/dashboard/invoices": "Invoices",
    "/dashboard/schools": "Schools",
    "/dashboard/analytics": "Analytics",
    "/dashboard/stats": "Statistics",
    "/dashboard/subscription": "Subscription",
    "/dashboard/billing": "Billing",
    "/dashboard/admin": "Admin",
  };

  const title = titles[pathname] ?? "Dashboard";

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          {title}
        </h2>

        <p className="text-sm text-slate-500">
          Welcome back to CyberMind
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          aria-label="Notifications"
          className="p-2"
        >
          <Bell size={20} />
        </Button>

        <UserMenu />
      </div>
    </header>
  );
}
