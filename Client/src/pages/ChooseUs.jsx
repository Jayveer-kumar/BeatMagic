export default function ChooseUs() {
  return (
    <section id="Whychooseus" className="px-5 w-full py-28 bg-black text-white">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-4">
          Why <span className="text-[#4f9cff]">Choose Us?</span>
        </h2>
        <p className="text-center text-gray-300 max-w-2xl mx-auto mb-16">
          A pricing-section feel, but everything is 100% free — and better than
          paid tools.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Card */}
          <div className="relative p-10 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl shadow-xl hover:-translate-y-2 transition">
            <h3 className="text-3xl font-bold mb-4">🎧 Studio-Quality Audio</h3>
            <p className="text-gray-300">
              Advanced DSP engine, smooth 3D rotation, spatial clarity, pro bass
              boost — engineered like a DAW plugin.
            </p>
          </div>

          <div className="relative p-10 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl shadow-xl hover:-translate-y-2 transition">
            <h3 className="text-3xl font-bold mb-4">
              ⚡ Super Fast Processing
            </h3>
            <p className="text-gray-300">
              Python + FFmpeg pipeline gives lightning-fast exports. Even long
              songs render in seconds.
            </p>
          </div>

          <div className="relative p-10 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl shadow-xl hover:-translate-y-2 transition">
            <h3 className="text-3xl font-bold mb-4">🆓 Completely Free</h3>
            <p className="text-gray-300">
              No login, no signup, no subscription. Just upload, convert,
              download. *Absolutely free forever.*
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
