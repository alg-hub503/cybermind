import type { ReactNode } from "react";

import Sidebar from "@/components/dashboard/sidebar";
import Navbar from "@/components/dashboard/navbar";
import TrialAccessProvider from "@/components/dashboard/trial-access-provider";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <TrialAccessProvider>
      <div className="flex min-h-screen bg-slate-100">
        <Sidebar />

        <div className="flex min-h-screen flex-1 flex-col lg:ms-64">
          <Navbar />

          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </TrialAccessProvider>
  );
}
