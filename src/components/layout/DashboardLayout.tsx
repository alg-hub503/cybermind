import type { ReactNode } from "react";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] text-white">
      {/* ULTRA CYBER BACKGROUND */}
      <div className="absolute inset-0">
        {/* gradient base */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,255,255,0.18),transparent_55%),radial-gradient(circle_at_bottom,rgba(124,58,237,0.18),transparent_60%)]" />

        {/* animated light orbs */}
        <div className="absolute left-[-200px] top-[-200px] h-[500px] w-[500px] animate-pulse rounded-full bg-cyan-400/20 blur-[120px]" />

        <div className="absolute bottom-[-200px] right-[-200px] h-[500px] w-[500px] animate-pulse rounded-full bg-purple-500/20 blur-[120px]" />

        {/* grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

        {/* moving glow */}
        <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.08),transparent_70%)]" />
      </div>

      <Sidebar />

      <div className="relative z-10 ml-[90px]">
        <Navbar />

        {children}
      </div>
    </main>
  );
}