import { Upload, Settings, Download } from "lucide-react";

export default function Steps() {
  const steps = [
    {
      icon: <Upload size={36} className="text-cyan-400" />,
      title: "1. Upload or Paste URL",
      desc: "Choose a file or convert any YouTube song directly.",
    },
    {
      icon: <Settings size={36} className="text-purple-400" />,
      title: "2. Select Effect",
      desc: "Pick 3D, 8D, or 16D with advanced movement patterns.",
    },
    {
      icon: <Download size={36} className="text-green-400" />,
      title: "3. Download Output",
      desc: "Get your processed MP3 instantly — no signup required.",
    },
  ];

  return (
    <section className="px-5 w-full py-24 bg-gradient-to-b from-[#050b14] to-[#081020] text-white">
      <div className="max-w-screen-2xl mx-auto px-6">
        <h2 className="text-center text-3xl md:text-4xl font-bold mb-16">
          How It <span className="text-purple-400">Works</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((s, i) => (
            <div
              key={i}
              className="bg-[#0e1727] border border-[#1e2a40] rounded-2xl p-8 shadow-xl hover:shadow-purple-500/20 transition-all"
            >
              <div className="mb-6">{s.icon}</div>
              <h3 className="text-xl font-bold mb-3">{s.title}</h3>
              <p className="text-gray-300">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
