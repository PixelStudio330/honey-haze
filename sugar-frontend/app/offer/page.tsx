'use client';
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Clock, Star, Heart } from "lucide-react";

type Offer = {
  id: number;
  title: string;
  description: string;
  image: string;
  imageLeft: boolean;
  color: string;
};

export default function Offers() {
  const [timeLeft, setTimeLeft] = useState(0);

  const offers: Offer[] = [
    {
      id: 1,
      title: "Sweet Treat Bundle 🍰",
      description: "Get 3 cupcakes + 1 donut free! Only for chaotic souls who need a sugar hug.",
      image: "/images/offers/sweet-treats.jpg",
      imageLeft: true,
      color: "#F4C2C2", // Soft Pink
    },
    {
      id: 2,
      title: "Sugar Magic Box ✨",
      description: "A mystery selection of our finest pastries! Resets every 48 hours for a fresh surprise.",
      image: "/images/offers/mystery-offer.jpg",
      imageLeft: false,
      color: "#FFE6ED", // Lighter Pink
    },
    {
      id: 3,
      title: "Coffee + Cookie Combo ☕🍪",
      description: "The perfect pair. Grab your favorite artisan cookie with any brew. 2-day special!",
      image: "/images/offers/cookie.jpg",
      imageLeft: true,
      color: "#FDF6F8", // Creamy Pink
    },
  ];

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const resetInterval = 48 * 60 * 60 * 1000;
      const start = new Date("2026-03-01T00:00:00").getTime(); // Updated for current year
      const elapsed = now.getTime() - start;
      const remaining = resetInterval - (elapsed % resetInterval);
      setTimeLeft(remaining);
    };
    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { hours, minutes, seconds };
  };

  const { hours, minutes, seconds } = formatTime(timeLeft);

  return (
    <section className="relative py-32 bg-[#F0EBD1] overflow-hidden flex flex-col items-center">
      {/* Background Decor */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -top-20 -right-20 text-[#D4A24C] opacity-10"
      >
        <Sparkles size={300} />
      </motion.div>

      {/* Header Section */}
      <div className="relative z-10 text-center mb-24 px-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-block bg-white/50 backdrop-blur-sm px-4 py-1 rounded-full text-[#D4A24C] font-black text-xs uppercase tracking-[0.2em] mb-4 border border-[#D4A24C]/20"
        >
          Limited Time Only
        </motion.div>
        
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-5xl md:text-7xl font-black text-[#8A5559] tracking-tighter"
        >
          Weekly <span className="text-[#C98895] italic">Specials</span>
        </motion.h1>
        
        {/* Animated Custom Timer Bar */}
        <div className="mt-8 flex gap-3 items-center justify-center">
          {[hours, minutes, seconds].map((unit, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="bg-white px-4 py-2 rounded-2xl shadow-[4px_4px_0px_#D4A24C] border-2 border-[#8A5559]">
                <span className="text-2xl font-black text-[#8A5559] tabular-nums">
                  {unit.toString().padStart(2, "0")}
                </span>
              </div>
              {i < 2 && <span className="font-black text-[#8A5559] text-2xl animate-pulse">:</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Offers Grid */}
      <div className="relative z-10 flex flex-col gap-20 w-full max-w-5xl px-6">
        {offers.map((offer, idx) => (
          <motion.div
            key={offer.id}
            initial={{ opacity: 0, x: offer.imageLeft ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -10 }}
            className={`group flex flex-col md:flex-row items-stretch bg-white rounded-[3rem] shadow-[15px_15px_0px_#8A5559] border-4 border-[#8A5559] overflow-hidden`}
          >
            {/* Image Side */}
            <div className={`w-full md:w-1/2 h-80 md:h-auto overflow-hidden relative ${!offer.imageLeft && 'md:order-last'}`}>
              <motion.img
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.6 }}
                src={offer.image}
                alt={offer.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1">
                <Heart size={14} className="text-[#C98895] fill-[#C98895]" />
                <span className="text-[10px] font-black uppercase text-[#8A5559]">Honey Pick</span>
              </div>
            </div>

            {/* Content Side */}
            <div className="p-10 md:w-1/2 flex flex-col justify-center gap-6 relative">
              {/* Decorative Icon */}
              <div className="absolute top-6 right-8 text-[#D4A24C] opacity-20 group-hover:opacity-100 group-hover:rotate-12 transition-all">
                <Star size={40} fill="currentColor" />
              </div>

              <h2 className="text-3xl md:text-4xl font-black text-[#8A5559] leading-none">
                {offer.title}
              </h2>
              
              <p className="text-[#8A5559]/70 font-medium text-lg leading-relaxed">
                {offer.description}
              </p>

              <div className="flex items-center gap-4">
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  className="bg-[#D4A24C] text-white font-black px-8 py-4 rounded-2xl shadow-[0px_5px_0px_#8A5559] hover:bg-[#C98895] transition-colors uppercase text-sm tracking-widest"
                >
                  Claim Offer ✨
                </motion.button>
                <div className="text-[#C98895] font-black text-xs uppercase underline cursor-pointer">
                  Details
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Floating Sticker Bottom */}
      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="mt-20 bg-[#C98895] text-white px-6 py-2 rounded-xl rotate-3 shadow-lg font-black uppercase text-sm"
      >
        Don't miss out, cutie! ૮₍ ˶ᵔ ᵕ ᵔ˶ ₎ა
      </motion.div>
    </section>
  );
}