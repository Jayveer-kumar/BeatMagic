export default function Footer(){
    return (
<footer className="px-5  w-full py-12 bg-[#0a0f1c] text-white  border-t border-white/10">
  <div className="container mx-auto px-6">

    <div className="flex flex-col md:flex-row justify-between items-start gap-10">

      {/* Left */}
      <div>
        <h2 className="text-3xl font-extrabold mb-3">
          3D Audio Maker<span className="text-[#4f9cff]">.</span>
        </h2>
        <p className="text-gray-400 max-w-sm">
          Create immersive 3D, 8D, and spatial audio instantly.  
          Built for creators — free for everyone.
        </p>
      </div>

      {/* Center Links */}
      <div className="flex flex-col gap-2 text-gray-300">
        <a className="hover:text-[#4f9cff] transition">Home</a>
        <a className="hover:text-[#4f9cff] transition">Features</a>
        <a className="hover:text-[#4f9cff] transition">How It Works</a>
        <a className="hover:text-[#4f9cff] transition">Showcase</a>
      </div>

      {/* Right */}
      <div className="text-gray-300">
        <p className="mb-2">Made with ❤️ by Jayveer</p>
        <p className="text-sm text-gray-500">© {new Date().getFullYear()} All Rights Reserved.</p>
      </div>

    </div>

  </div>
</footer>

    )
}