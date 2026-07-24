"use client";

import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  FileText,
  GraduationCap,
  BarChart3,
  CreditCard,
  Shield,
  Crown,
} from "lucide-react";

import NavItem from "./nav-item";

export default function Sidebar() {
  const { data: session } = useSession();

  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <aside className="hidden min-h-screen w-64 flex-col border-r border-slate-800 bg-slate-900 lg:flex">
      <div className="border-b border-slate-800 p-6">
        <h1 className="text-2xl font-bold text-white">
          Cyber<span className="text-blue-500">Mind</span>
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          AI SaaS Platform
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-2 p-4">
        <NavItem
          href="/dashboard"
          label="Dashboard"
          icon={<LayoutDashboard size={20} />}
        />

        <NavItem
          href="/dashboard/clients"
          label="Clients"
          icon={<Users size={20} />}
        />

        <NavItem
          href="/dashboard/invoices"
          label="Invoices"
          icon={<FileText size={20} />}
        />

        <NavItem
          href="/dashboard/schools"
          label="Schools"
          icon={<GraduationCap size={20} />}
        />

        <NavItem
          href="/dashboard/stats"
          label="Stats"
          icon={<BarChart3 size={20} />}
        />

        <NavItem
          href="/dashboard/subscription"
          label="Subscription"
          icon={<Crown size={20} />}
        />

        <NavItem
          href="/dashboard/billing"
          label="Billing"
          icon={<CreditCard size={20} />}
        />

        {isAdmin && (
          <NavItem
            href="/dashboard/admin"
            label="Admin"
            icon={<Shield size={20} />}
          />
        )}
      </nav>

     <div className="border-t border-slate-800 p-6">
  <div className="space-y-1">
    <p className="font-semibold text-white">
      {session?.user?.name ?? "Unknown User"}
    </p>

    <p className="text-sm text-slate-400">
      {session?.user?.email}
    </p>

    <span className="inline-flex rounded-full bg-blue-600 px-2 py-1 text-xs font-semibold text-white">
      {session?.user?.role}
    </span>
  </div>
</div>
    </aside>
  );
}
