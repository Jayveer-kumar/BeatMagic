import InstagramIcon from '@mui/icons-material/Instagram';
import CopyrightIcon from '@mui/icons-material/Copyright';
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
        <a href="#Home" className="hover:text-[#4f9cff] transition cursor-pointer">Home</a>
        <a href="#Features" className="hover:text-[#4f9cff] transition cursor-pointer">Features</a>
        <a href="#Lovedby" className="hover:text-[#4f9cff] transition cursor-pointer">Loved By</a>
        <a href="#Whychooseus" className="hover:text-[#4f9cff] transition cursor-pointer">Why Choose us</a>
        <a href="#Contact" className="hover:text-[#4f9cff] transition cursor-pointer">Contact</a>
      </div>

      {/* Right */}
      <div className="text-gray-300">
        <p className="mb-2">Made with ❤️ by Jayveer</p>
        {/* <p className="text-sm text-gray-500 "><CopyrightIcon style={{fontSize :"15px"}}  /> {new Date().getFullYear()} All Rights Reserved.</p> */}
        <div className="text-gray-300">
  {/* Instagram Line */}
  <p className="flex items-center gap-1 mb-2 text-sm">
    Meet the creator
    <a 
      href="https://instagram.com/jasan_0987" 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex items-center gap-1"
    >
       <InstagramIcon style={{
          fontSize: "18px",
          background: "linear-gradient(45deg, #feda75, #fa7e1e, #d62976, #962fbf, #4f5bd5)",
          WebkitTextFillColor: "transparent",
          WebkitBackgroundClip: "text"
        }}  /> 
         
     
      <span>@jasan_0987</span>
    </a>
  </p>

  {/* Copyright Line */}
  <p className="text-sm text-gray-500 flex items-center gap-1">
    <CopyrightIcon style={{ fontSize: "13px" }} />
    {new Date().getFullYear()} All Rights Reserved.
  </p>
</div>
      </div>

    </div>

  </div>
</footer>

    )
}