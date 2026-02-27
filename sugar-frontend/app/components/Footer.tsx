'use client';

import Link from "next/link";
import { Facebook, Instagram, Github } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Reviews", href: "/reviews" },
    { name: "Offers", href: "/offer" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <footer className="relative overflow-hidden bg-[#CBD5C0] mt-0">
      {/* 🧁 MAIN FOOTER SECTION */}
      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-start gap-10 relative z-10">

        {/* 🍑 Logo & Description */}
        <div className="flex flex-col items-start gap-2">
          <Link href="/" className="flex items-center gap-3 group">
            <motion.img
              src="images/logo.jpg"
              alt="Sugar Land Logo"
              className="w-12 h-12 object-cover rounded-full border-2 border-[#DD8D6E] shadow-lg"
              whileHover={{ scale: 1.15, rotate: 8 }}
              transition={{ type: "spring", stiffness: 250, damping: 20 }}
            />
            <span className="text-2xl font-extrabold text-[#C98895] group-hover:text-[#66a183] transition-colors duration-300">
              Honey Haze
            </span>
          </Link>
          <p className="text-sm text-[#C98895]/70 font-medium">
            Cute vibes • Chaotic souls • Sweet creations 🍭
          </p>
        </div>

        {/* 💖 QUICK LINKS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-6 text-[#C98895] font-semibold">
          {quickLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="relative hover:text-[#66a183] transition-all duration-300 group"
            >
              <span className="relative z-10">{link.name}</span>
              <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-[#C98895] transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
        </div>
      </div>

      {/* ✨ BOTTOM BAR */}
      <div className="max-w-6xl mx-auto px-6 py-5 border-t border-[#C2A342]/40 flex flex-col md:flex-row justify-between items-center text-[#C98895] text-sm font-medium relative z-10">
        {/* Left side */}
        <p>© {new Date().getFullYear()} Honey Haze. All sparkles reserved ✨</p>

        {/* Social Icons */}
        <div className="flex gap-4 mt-3 md:mt-0">
          {[
            { icon: <Facebook size={20} />, href: "https://facebook.com" },
            { icon: <Instagram size={20} />, href: "https://instagram.com" },
            { icon: <Github size={20} />, href: "https://github.com" },
          ].map((social, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.3, rotate: 10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Link
                href={social.href}
                target="_blank"
                className="text-[#C98895] hover:text-[#66a183] transition-all duration-300"
              >
                {social.icon}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </footer>
  );
}
