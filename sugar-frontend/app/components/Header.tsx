'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Reviews", href: "/reviews" },
    { name: "Offers", href: "/offer" },
    { name: "Contact", href: "/contact" },
  ];

  if (!mounted) return null;

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-[#F9D7D7]/70 via-[#FFF6E0]/70 to-[#C8E3D4]/70 backdrop-blur-lg border-b border-[#F4C2C2]/40 shadow-[0_3px_20px_rgba(255,192,203,0.3)]">
      <div className="flex justify-between items-center px-6 md:px-10 py-5">

        {/* 🍭 Logo + Title */}
        <Link
          href="/"
          className="flex items-center gap-3 group"
          onClick={(e) => {
            e.preventDefault();
            setMenuOpen(false);
            window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
            if (pathname !== "/") window.location.href = "/";
          }}
        >
          <motion.img
            src="images/logo.jpg"
            alt="Sugar Land Logo"
            className="w-10 h-10 object-cover rounded-full border-2 border-[#F6D6E0] shadow-md"
            whileHover={{ scale: 1.1, rotate: 8 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          />
          <motion.span
  className="text-2xl font-bold text-[#a14b45e8] transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(130,168,153,0.8)]"
  animate={{ y: [0, -3, 0] }}
  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
>
  Honey Haze ૮₍ ´˶• ˕ •˶` ₎ა
</motion.span>

        </Link>

        {/* 🌸 Desktop Nav */}
        <nav className="hidden md:flex space-x-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <div key={link.name} className="relative group">
                <Link
                  href={link.href}
                  className={`font-semibold text-lg transition-all duration-300 ${
                    isActive
                      ? "text-[#a14b45e8]"
                      : "text-[#a14b45e8]/80 hover:text-[#57352c]"
                  }`}
                >
                  {link.name}
                </Link>
                <span
                  className={`absolute left-0 bottom-[-4px] h-[2px] rounded-full transition-all duration-500 ${
                    isActive
                      ? "bg-[#a14b45e8] w-full"
                      : "bg-[#a14b45e8]/50 w-0 group-hover:w-full"
                  }`}
                ></span>
              </div>
            );
          })}
        </nav>

        {/* 🍬 Mobile Menu Toggle */}
        <button
          className="md:hidden text-[#82A899]"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* 💖 Floating Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="md:hidden flex flex-col items-center space-y-4 pb-6 pt-3 bg-gradient-to-b from-[#FFF6E0]/90 to-[#F9D7D7]/90 border-t border-[#F4C2C2]/40"
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`font-medium text-lg transition-all duration-300 ${
                    isActive
                      ? "text-[#82A899] underline underline-offset-4 decoration-[#82A899]"
                      : "text-[#82A899]/90 hover:text-[#82A899]"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.name}
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
