import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="w-full bg-black text-white fixed top-0 left-0 z-50">
      <nav className=" mx-auto px-5 py-4 flex justify-between items-center">
        
        {/* Logo max-w-6xl */}
        <h1 className="text-2xl font-bold tracking-wide cursor-pointer px-5">
          BeatMagic
        </h1>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-8 text-lg">
          <li className="hover:text-gray-300 cursor-pointer">
            <a href="#Home">  Home </a>
          </li>
          <li className="hover:text-gray-300 cursor-pointer">
            <a href="#Features">Features</a>
          </li>
          <li className="hover:text-gray-300 cursor-pointer">
            <a href="#Lovedby">Loved by</a>
          </li>
          <li className="hover:text-gray-300 cursor-pointer">
            <a href="#Whychooseus">Why Choose us</a>
          </li>
          <li className="hover:text-gray-300 cursor-pointer">
            <a href="#Contact">Contact</a>
          </li>
        </ul>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white text-3xl"
          onClick={() => setIsOpen(true)}
        >
          <MenuIcon className="cursor-pointer" fontSize="inherit" />
        </button>
      </nav>

      {/* Sidebar (Mobile Menu) */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-[#111] text-white transform 
        transition-transform duration-300 ease-out z-50
        ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Close Button */}
        <div className="flex justify-end p-4">
          <button
            className="text-3xl"
            onClick={() => setIsOpen(false)}
          >
            <CloseIcon className="cursor-pointer" fontSize="inherit" />
          </button>
        </div>

        {/* Sidebar Links */}
        <ul className="flex flex-col space-y-6 text-xl p-6">
          <li className="hover:text-gray-300 cursor-pointer" onClick={() => setIsOpen(false)}>
            <a href="#Home">Home</a>
          </li>
          <li className="hover:text-gray-300 cursor-pointer" onClick={() => setIsOpen(false)}>
            <a href="#Features">Features</a>
          </li>
          <li className="hover:text-gray-300 cursor-pointer" onClick={() => setIsOpen(false)}>
            <a href="#Lovedby">Loved by</a>
          </li>
          <li className="hover:text-gray-300 cursor-pointer" onClick={() => setIsOpen(false)}>
            <a href="#Whychooseus">Why Choose us</a>
          </li>
          <li className="hover:text-gray-300 cursor-pointer" onClick={() => setIsOpen(false)}>
            <a href="#Contact">Contact</a>
          </li>
        </ul>
      </div>
    </header>
  );
}
