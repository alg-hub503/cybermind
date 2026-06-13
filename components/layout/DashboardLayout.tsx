import Sidebar from "./Sidebar"
import Navbar from "./Navbar"

export default function DashboardLayout({
  children,
}:{
  children: React.ReactNode
}) {

  return (

    <main className="bg-[#050816] min-h-screen">

      <Sidebar />

      <div className="ml-[110px]">

        <Navbar />

        {children}

      </div>

    </main>

  )
}