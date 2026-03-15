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
    { name: "Order History", href: "/order-history" },
  ];

  if (!mounted) return null;

  return (
    /* REMOVED shadow-sm and ADJUSTED bg-white opacity to prevent the dark blur bleed */
    <header className="fixed top-0 left-0 w-full z-[100] bg-white/80 backdrop-blur-md border-b-[3px] border-[#F4C2C2]/50 bg-clip-padding">
      <div className="flex justify-between items-center px-6 md:px-10 py-5">
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
            className="w-10 h-10 object-cover rounded-full border-2 border-[#F6D6E0]"
            whileHover={{ scale: 1.1, rotate: 8 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          />
          <motion.span
            className="text-2xl font-black text-[#8A5559]"
            animate={{ y: [0, -2, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            Honey Haze ૮₍ ´˶• ˕ •˶` ₎ა
          </motion.span>
        </Link>

        <nav className="hidden md:flex space-x-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <div key={link.name} className="relative group">
                <Link
                  href={link.href}
                  className={`font-black text-sm uppercase tracking-wider transition-all duration-300 ${
                    isActive ? "text-[#8A5559]" : "text-[#8A5559]/60 hover:text-[#8A5559]"
                  }`}
                >
                  {link.name}
                </Link>
                <span className={`absolute left-0 bottom-[-4px] h-[3px] rounded-full transition-all duration-500 ${isActive ? "bg-[#D4A24C] w-full" : "bg-[#D4A24C]/40 w-0 group-hover:w-full"}`}></span>
              </div>
            );
          })}
        </nav>

        <button className="md:hidden text-[#8A5559]" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden flex flex-col items-center space-y-4 pb-8 pt-4 bg-white/95 border-t border-[#F4C2C2]/40 shadow-lg"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="font-black text-lg text-[#8A5559] uppercase"
                onClick={() => setMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}