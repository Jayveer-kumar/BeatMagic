// Showcase.jsx
export default function Showcase() {
    return (
        
<section className="px-5 w-full py-28 bg-gradient-to-b from-black to-[#0b1220] text-white">
  <div className="container mx-auto px-6 text-center">

    <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
      Hear The <span className="text-[#4f9cff]">Difference</span>
    </h2>

    <p className="text-gray-300 max-w-2xl mx-auto mb-16">
      A dynamic 3D sound engine that rotates vocals, instruments, bass, and reverb 
      to give you a fully immersive experience.
    </p>

    <div className="max-w-4xl mx-auto">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10">

        {/* Waveform Bars */}
        <div className="flex items-end justify-center gap-1 h-32">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-[#4f9cff] rounded-full animate-pulse"
              style={{ height: `${Math.random() * 100}px`, animationDuration: `${0.6 + Math.random()}s` }}
            ></div>
          ))}
        </div>

        <p className="text-gray-400 mt-6 text-sm">
          *Waveform visual reacts dynamically.
        </p>
      </div>
    </div>

  </div>
</section>

    )

//   return (
//     <section className="w-full py-24 bg-[#060d17] text-white">
//       <div className="max-w-screen-2xl mx-auto px-6">

//         <h2 className="text-center text-3xl md:text-4xl font-bold mb-12">
//           Audio <span className="text-pink-400">Showcase</span>
//         </h2>

//         <div className="bg-[#0d1524] border border-[#1b263b] rounded-2xl p-10 shadow-xl">

//           {/* Waveform */}
//           <div className="flex items-end gap-1 h-32 mb-8">
//             {[...Array(60)].map((_, i) => (
//               <div
//                 key={i}
//                 className="w-1 bg-pink-400 rounded animate-wave"
//                 style={{
//                   animationDelay: `${i * 0.05}s`,
//                   height: `${20 + Math.random() * 80}px`,
//                 }}
//               ></div>
//             ))}
//           </div>

//           <p className="text-center text-lg text-gray-300">
//             Real-time 3D/8D/16D spatial audio rendering powered by Python engine.
//           </p>

//         </div>

//       </div>
//     </section>
//   );

}
