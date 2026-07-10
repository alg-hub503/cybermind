import { Home, Search, Bot, Rocket, Newspaper, Settings } from "lucide-react";

const items = [Home, Search, Bot, Rocket, Newspaper, Settings];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-[90px] bg-white/5 backdrop-blur-xl border-r border-cyan-400/10 flex flex-col items-center py-8 gap-10">

      <div className="text-cyan-400 font-black text-xl tracking-widest">
        CM
      </div>

      {items.map((Icon, i) => (
        <div
          key={i}
          className="text-gray-400 hover:text-cyan-300 hover:scale-125 transition cursor-pointer"
        >
          <Icon size={20} />
        </div>
      ))}

    </aside>
  );
}