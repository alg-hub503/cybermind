export default function Hero() {
  return (
    <section className="relative overflow-hidden px-8 pt-16 pb-20">

      {/* glow orbs */}
      <div className="absolute top-0 left-20 w-[350px] h-[350px] bg-cyan-500/20 blur-[140px] rounded-full" />
      <div className="absolute right-0 top-20 w-[300px] h-[300px] bg-purple-600/20 blur-[120px] rounded-full" />

      <div className="relative z-10">

        {/* TOP HERO */}

        <div className="grid lg:grid-cols-2 gap-10 items-center">

          <div>

            <div className="inline-flex px-4 py-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 text-cyan-300 text-sm mb-6">
              NEXT GENERATION AI PLATFORM
            </div>

            <h1 className="text-6xl lg:text-7xl font-black leading-none">

              <span className="text-white">
                FUTURE
              </span>

              <br/>

              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 text-transparent bg-clip-text">
                OF AI
              </span>

            </h1>

            <p className="text-gray-400 text-lg mt-8 max-w-xl leading-relaxed">
              Discover AI tools, news, prompts, automation, monetization and futuristic technology in one premium dashboard.
            </p>

            <div className="flex flex-wrap gap-4 mt-10">

              <button className="px-7 py-4 rounded-2xl bg-cyan-400 text-black font-bold hover:scale-105 transition">
                Explore AI
              </button>

              <button className="px-7 py-4 rounded-2xl border border-white/10 bg-white/5 text-white">
                AI Chat Hub
              </button>

            </div>

          </div>

          {/* visual panel */}

          <div className="relative">

            <div className="rounded-[34px] border border-cyan-400/10 bg-white/5 backdrop-blur-2xl p-8 shadow-2xl">

              <div className="flex justify-between mb-8">

                <div>
                  <h3 className="text-white font-bold text-xl">
                    CYBERMIND
                  </h3>

                  <p className="text-gray-500 text-sm">
                    AI Intelligence System
                  </p>
                </div>

                <div className="text-cyan-400 font-bold">
                  LIVE
                </div>

              </div>

              <div className="grid grid-cols-2 gap-5">

                {[
                  ["5.2K","AI Tools"],
                  ["98%","Accuracy"],
                  ["24/7","Active"],
                  ["120+","Sources"]
                ].map((item)=>(
                  <div
                    key={item[1]}
                    className="rounded-2xl p-5 bg-black/30 border border-white/10"
                  >
                    <h2 className="text-cyan-300 text-3xl font-black">
                      {item[0]}
                    </h2>

                    <p className="text-gray-500 text-sm mt-2">
                      {item[1]}
                    </p>

                  </div>
                ))}

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}