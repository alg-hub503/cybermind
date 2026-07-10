"use client";

import { Bell } from "lucide-react";
import { usePathname } from "next/navigation";

import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import UserMenu from "@/components/dashboard/user-menu";

export default function Navbar() {
  const pathname = usePathname();

  const titles: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/dashboard/clients": "Clients",
    "/dashboard/invoices": "Invoices",
    "/dashboard/schools": "Schools",
    "/dashboard/stats": "Statistics",
    "/dashboard/subscription": "Subscription",
    "/dashboard/billing": "Billing",
    "/dashboard/admin": "Admin",
    "/dashboard/users": "Users",
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
        <div className="hidden w-72 md:block">
          <Input placeholder="Search clients, invoices..." />
        </div>

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