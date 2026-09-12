import type { ReactNode } from "react";

import Navbar from "@/components/dashboard/navbar";
import Sidebar from "@/components/dashboard/sidebar";
import TrialAccessProvider from "@/components/dashboard/trial-access-provider";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <TrialAccessProvider>
      <div className="min-h-screen min-w-0 bg-slate-100">
        <Sidebar />

        <div className="min-w-0 lg:ms-64">
          <Navbar />

          <main className="min-w-0 p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </TrialAccessProvider>
  );
}