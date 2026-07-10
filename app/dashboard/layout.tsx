import type { ReactNode } from "react";

import Sidebar from "@/components/dashboard/sidebar";
import Navbar from "@/components/dashboard/navbar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar />

      <div className="ml-[110px]">
        <Navbar />

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}