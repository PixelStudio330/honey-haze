'use client';

import Link from "next/link";
import { Facebook, Instagram, Github, Heart, LogIn } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  // Navigation links without "Sign In"
  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Reviews", href: "/reviews" },
    { name: "Offers", href: "/offer" },
    { name: "Contact", href: "/contact" },
    { name: "Order History", href: "/order-history" },
  ];

  return (
    <footer className="relative overflow-hidden bg-[#F0EBD1] border-t-4 border-[#C98895]/20">
      {/* 🌸 Decorative Background Elements */}
      <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-[#C98895]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-50px] right-[-50px] w-64 h-64 bg-[#D4A24C]/5 rounded-full blur-3xl" />

      {/* 🧁 MAIN FOOTER SECTION */}
      <div className="max-w-7xl mx-auto px-8 py-16 flex flex-col md:flex-row justify-between items-start gap-12 relative z-10">

        {/* 🍑 Logo & Brand Story */}
        <div className="flex flex-col items-start gap-4 max-w-xs">
          <Link href="/" className="flex items-center gap-3 group">
            <motion.img
              src="/images/logo.jpg"
              alt="Honey Haze Logo"
              className="w-14 h-14 object-cover rounded-full border-4 border-white shadow-[8px_8px_0_rgba(201,136,149,0.1)]"
              whileHover={{ scale: 1.1, rotate: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
            <div className="flex flex-col">
              <span className="text-3xl font-black text-[#8A5559] tracking-tighter leading-none">
                Honey Haze
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4A24C] mt-1">
                Est. 2018
              </span>
            </div>
          </Link>
          <p className="text-sm text-[#8A5559]/70 font-semibold leading-relaxed">
            Crafting chaotic sweetness for aesthetic souls. Every treat is a masterpiece, every bite is an adventure. 🍭✨
          </p>
        </div>

        {/* 💖 NAVIGATION & AUTH */}
        <div className="flex flex-col items-start md:items-end gap-8 w-full md:w-auto">
          {/* Quick Links Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-4 w-full md:w-auto">
            {quickLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-[#8A5559]/60 hover:text-[#C98895] font-black text-xs uppercase tracking-widest transition-colors duration-300 flex items-center gap-2 group"
              >
                <span className="w-1.5 h-1.5 bg-[#D4A24C] rounded-full scale-0 group-hover:scale-100 transition-transform duration-300" />
                {link.name}
              </Link>
            ))}
          </div>

          {/* Special Sign In Button - Positioned below navs */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="w-full md:w-auto"
          >
            <Link href="/login" className="block">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-full md:w-auto flex items-center justify-center gap-3 bg-white border-2 border-[#C98895]/20 text-[#C98895] font-black text-xs uppercase tracking-[0.2em] px-8 py-4 rounded-2xl shadow-[6px_6px_0_rgba(201,136,149,0.1)] hover:shadow-[8px_8px_0_rgba(201,136,149,0.15)] transition-all"
              >
                <LogIn size={16} />
                Client Sign In
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ✨ BOTTOM BAR */}
      <div className="bg-white/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-8 py-8 border-t border-[#8A5559]/5 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          
          {/* Copyright */}
          <div className="flex items-center gap-2 text-[#8A5559]/60 text-[11px] font-black uppercase tracking-wider">
            <span>© {new Date().getFullYear()} Honey Haze</span>
            <Heart size={12} className="text-[#C98895] fill-[#C98895]" />
            <span>All sparkles reserved</span>
          </div>

          {/* Social Icons */}
          <div className="flex gap-6">
            {[
              { icon: <Facebook size={20} />, href: "https://facebook.com" },
              { icon: <Instagram size={20} />, href: "https://instagram.com" },
              { icon: <Github size={20} />, href: "https://github.com" },
            ].map((social, idx) => (
              <motion.a
                key={idx}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -5, color: "#D4A24C" }}
                className="text-[#8A5559]/40 transition-colors"
              >
                {social.icon}
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}