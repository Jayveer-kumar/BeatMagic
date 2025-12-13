import { Sparkles, Radio, Headphones, Zap } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: <Radio size={32} className="text-cyan-400" />,
      title: "Convert to 3D / 8D / 16D",
      desc: "Experience immersive audio rotation powered by an adaptive movement engine.",
    },
    {
      icon: <Headphones size={32} className="text-purple-400" />,
      title: "Studio-Grade Processing",
      desc: "Stem separation, spatial panning, reverb IRs and LUFS normalization.",
    },
    {
      icon: <Sparkles size={32} className="text-pink-400" />,
      title: "Upload or YouTube URL",
      desc: "Choose your own mode. Works directly from browser. No signup required.",
    },
    {
      icon: <Zap size={32} className="text-yellow-400" />,
      title: "Fast Processing",
      desc: "Optimized Python engine + FFmpeg export for ultra-fast output.",
    },
  ];

  return (
    <section id="Features" className="px-5 w-full py-20 bg-[#050b14] text-white">
      <div className="max-w-screen-2xl mx-auto px-6">
        
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Powerful Features, <span className="text-cyan-400">Built for Creators</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-[#0d1524] border border-[#1b263b] rounded-xl p-6 hover:border-cyan-400 transition-all shadow-lg hover:shadow-cyan-500/20"
            >
              <div className="mb-4">{f.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-300 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
