import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function DashboardLayout({ children }: any) {
  return (
    <main className="min-h-screen bg-[#050816] text-white relative overflow-hidden">

      {/* ULTRA CYBER BACKGROUND */}
      <div className="absolute inset-0">

        {/* gradient base */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,255,255,0.18),transparent_55%),radial-gradient(circle_at_bottom,rgba(124,58,237,0.18),transparent_60%)]" />

        {/* animated light orbs */}
        <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-cyan-400/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] animate-pulse" />

        {/* grid lines (cyber feel) */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

        {/* moving glow center */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.08),transparent_70%)] animate-pulse" />

      </div>

      {/* UI */}
      <Sidebar />

      <div className="ml-[90px] relative z-10">

        <Navbar />

        {children}

      </div>

    </main>
  );
}