export default function Hero() {
  return (
    <div className="p-10">

      {/* TITLE */}
      <div className="text-center mt-10">

        <h1 className="text-7xl font-black bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-500 text-transparent bg-clip-text">
          CYBERMIND
        </h1>

        <p className="text-gray-400 mt-3 tracking-widest">
          NEXT GENERATION AI PLATFORM
        </p>

      </div>

      {/* SEARCH */}
      <div className="mt-10 flex justify-center">

        <div className="w-[70%] p-5 rounded-2xl bg-white/5 border border-cyan-400/20 backdrop-blur-2xl flex gap-4">

          <input
            placeholder="Search AI tools, news, prompts, videos..."
            className="flex-1 bg-transparent outline-none text-white"
          />

          <button className="px-6 py-2 bg-cyan-400 text-black font-bold rounded-xl hover:scale-105 transition">
            Search
          </button>

        </div>

      </div>

      {/* STATS GLASS WALL */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-14">

        {[
          ["12K+", "AI Tools"],
          ["5M+", "Users"],
          ["99+", "Categories"],
          ["24/7", "Active"],
        ].map((item, i) => (

          <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl text-center hover:scale-105 transition">

            <h2 className="text-cyan-300 text-2xl font-bold">{item[0]}</h2>
            <p className="text-gray-400 text-sm mt-2">{item[1]}</p>

          </div>

        ))}

      </div>

      {/* AI TOOL WALL */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-14">

        {[
          "ChatGPT",
          "Claude",
          "Gemini",
          "Midjourney",
          "Runway",
          "Cursor",
          "Notion AI",
          "Perplexity",
        ].map((tool) => (

          <div
            key={tool}
            className="p-5 rounded-2xl bg-white/5 border border-cyan-400/10 backdrop-blur-xl hover:border-cyan-300/40 hover:scale-105 transition"
          >

            <h3 className="font-bold text-white">{tool}</h3>
            <p className="text-gray-500 text-sm mt-2">AI Tool</p>

          </div>

        ))}

      </div>

    </div>
  );
}