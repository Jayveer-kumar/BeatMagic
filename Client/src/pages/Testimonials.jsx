export default function Testimonials() {
  return (
    <section
      id="Lovedby"
      className="px-5 w-full py-24 bg-gradient-to-b from-[#0b1220] to-black text-white"
    >
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
          Loved By <span className="text-[#4f9cff]">Creators</span> Worldwide
        </h2>
        <p className="text-gray-300 max-w-2xl mx-auto mb-16">
          Early testers are already calling it the best 3D Audio generator.
          Fast, powerful, and insanely immersive.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Testimonial Card */}
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 shadow-xl backdrop-blur-xl">
            <p className="text-gray-200 mb-6">
              “The 8D effect feels like the vocals are circling around my head.
              Better than most paid tools!”
            </p>
            <div className="flex items-center gap-3 justify-center">
              <img
                className="w-12 h-12 rounded-full"
                src="https://i.pravatar.cc/100?img=1"
              />
              <div className="text-left">
                <h4 className="font-bold">Arjun M.</h4>
                <p className="text-gray-400 text-sm">Music Producer</p>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 shadow-xl backdrop-blur-xl">
            <p className="text-gray-200 mb-6">
              “The rotation engine is crazy accurate. I use it for TikTok
              remixes — people LOVE it.”
            </p>
            <div className="flex items-center gap-3 justify-center">
              <img
                className="w-12 h-12 rounded-full"
                src="https://i.pravatar.cc/100?img=7"
              />
              <div className="text-left">
                <h4 className="font-bold">Sneha R.</h4>
                <p className="text-gray-400 text-sm">TikTok Creator</p>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 shadow-xl backdrop-blur-xl">
            <p className="text-gray-200 mb-6">
              “Processed 12 tracks in minutes. MP3 export is super fast. No
              login, no limits.”
            </p>
            <div className="flex items-center gap-3 justify-center">
              <img
                className="w-12 h-12 rounded-full"
                src="https://i.pravatar.cc/100?img=15"
              />
              <div className="text-left">
                <h4 className="font-bold">Rahul D.</h4>
                <p className="text-gray-400 text-sm">Editor</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
