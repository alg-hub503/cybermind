export default function Navbar() {
  return (
    <header className="h-[80px] flex items-center justify-between px-8 bg-white/5 backdrop-blur-xl border-b border-cyan-400/10 text-white">

      <h1 className="text-cyan-400 font-black text-xl">
        CYBERMIND
      </h1>

      <input
        placeholder="Search AI tools..."
        className="bg-white/5 border border-cyan-400/20 px-4 py-2 rounded-xl outline-none focus:border-cyan-400 w-[300px]"
      />

      <div className="text-gray-400 text-sm">
        AI Dashboard
      </div>

    </header>
  );
}