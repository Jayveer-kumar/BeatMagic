import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const desktopLinks = [
    {
      id: 1,
      name: "Home",
      link: "#Home",
      styles: "hover:text-gray-300 cursor-pointer",
      fadeUp: "fade-down",
      fadeDuration: "600",
      fadeDelay: "0",
      fadeOffset: "0",
    },
    {
      id: 2,
      name: "Features",
      link: "#Features",
      styles: "hover:text-gray-300 cursor-pointer",
      fadeUp: "fade-down",
      fadeDuration: "600",
      fadeDelay: "50",
      fadeOffset: "0",
    },
    {
      id: 3,
      name: "Loved by",
      link: "#Lovedby",
      styles: "hover:text-gray-300 cursor-pointer",
      fadeUp: "fade-down",
      fadeDuration: "600",
      fadeDelay: "100",
      fadeOffset: "0",
    },
    {
      id: 4,
      name: "Why Choose us",
      link: "#Whychooseus",
      styles: "hover:text-gray-300 cursor-pointer",
      fadeUp: "fade-down",
      fadeDuration: "600",
      fadeDelay: "150",
      fadeOffset: "0",
    },
    {
      id: 5,
      name: "Contact",
      link: "#Contact",
      styles: "hover:text-gray-300 cursor-pointer",
      fadeUp: "fade-down",
      fadeDuration: "600",
      fadeDelay: "200",
      fadeOffset: "0",
    },
  ];


  return (
    <header className="w-full bg-black text-white fixed top-0 left-0 z-50">
      <nav className=" mx-auto px-5 py-4 flex justify-between items-center">
        {/* Logo max-w-6xl */}
        <h1
          data-aos="fade-down"
          data-aos-offset="50"
          data-aos-delay="0"
          data-aos-duration="1000"
          className="text-2xl font-bold tracking-wide cursor-pointer px-5"
        >
          BeatMagic
        </h1>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-8 text-lg">
          {desktopLinks.map((item) => (
            <li
              key={item.id}
              className={item.styles}
              data-aos={item.fadeUp}
              data-aos-duration={item.fadeDuration}
              data-aos-delay={item.fadeDelay}
              data-aos-offset={item.fadeOffset}
            >
              <a href={item.link}>{item.name}</a>
            </li>
          ))}
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
          <button className="text-3xl" onClick={() => setIsOpen(false)}>
            <CloseIcon className="cursor-pointer" fontSize="inherit" />
          </button>
        </div>

        {/* Sidebar Links */}
        <ul className="flex flex-col space-y-6 text-xl p-6">
          <li
            className="hover:text-gray-300 cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            <a href="#Home">Home</a>
          </li>
          <li
            className="hover:text-gray-300 cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            <a href="#Features">Features</a>
          </li>
          <li
            className="hover:text-gray-300 cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            <a href="#Lovedby">Loved by</a>
          </li>
          <li
            className="hover:text-gray-300 cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            <a href="#Whychooseus">Why Choose us</a>
          </li>
          <li
            className="hover:text-gray-300 cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            <a href="#Contact">Contact</a>
          </li>
        </ul>
      </div>
    </header>
  );
}
