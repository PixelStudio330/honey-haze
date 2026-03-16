'use client';
import { motion, Variants } from "framer-motion";
import { Phone, Heart, Sparkles, Utensils } from "lucide-react";

export default function Helpline() {
  const icons = [
    { icon: <Phone size={48} />, top: "15%", left: "10%", color: "#C98895" },
    { icon: <Heart size={40} />, top: "25%", left: "80%", color: "#D4A24C" },
    { icon: <Sparkles size={56} />, top: "65%", left: "15%", color: "#82A899" },
    { icon: <Utensils size={44} />, top: "75%", left: "75%", color: "#C98895" },
  ];

  const floatingVariants: Variants = {
    animate: (i: number) => ({
      y: [0, -20, 0],
      x: [0, 10, 0],
      rotate: [0, 10, -10, 0],
      transition: {
        duration: 5 + i,
        repeat: Infinity,
        ease: "easeInOut",
      },
    }),
  };

  return (
    <main className="relative bg-[#F0EBD1] min-h-screen flex flex-col items-center justify-center text-center overflow-hidden p-6 selection:bg-[#C98895]/30">
      
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#D4A24C]/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#C98895]/10 rounded-full blur-[120px] animate-pulse" />

      {/* FLOATING AESTHETIC ICONS */}
      <div className="absolute inset-0 pointer-events-none">
        {icons.map((item, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={floatingVariants}
            animate="animate"
            className="absolute opacity-20 hidden sm:block"
            style={{ top: item.top, left: item.left, color: item.color }}
          >
            {item.icon}
          </motion.div>
        ))}
      </div>

      {/* CONTENT CARD */}
      <section className="relative z-10 max-w-2xl flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <div className="inline-block px-4 py-1.5 bg-[#C98895]/10 border border-[#C98895]/20 rounded-full text-[#C98895] text-[10px] font-black uppercase tracking-[0.4em] mb-4">
            Support Line
          </div>

          <h1 className="text-5xl sm:text-7xl font-black text-[#C98895] tracking-tighter leading-tight">
            Need <span className="text-[#8b5a2b]">Assistance?</span>
          </h1>

          <p className="text-[#8b5a2b] text-lg sm:text-xl font-medium leading-relaxed max-w-md mx-auto">
            Our hive is always open. Reach out anytime for a little extra 
            <span className="italic"> sweetness</span> in your day. 🍯✨
          </p>
        </motion.div>

        {/* INTERACTIVE PHONE BUTTON */}
        <motion.div 
          className="mt-12"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <motion.a
            href="tel:+88801700000000"
            className="group relative flex items-center gap-4 bg-white/60 backdrop-blur-xl px-10 py-6 rounded-[2.5rem] border-4 border-white/80 shadow-[15px_15px_0_rgba(212,162,76,0.1)] transition-all"
            whileHover={{ 
              scale: 1.02, 
              y: -5,
              boxShadow: "20px 20px 0px rgba(201,136,149,0.15)"
            }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="bg-[#D4A24C] p-3 rounded-2xl text-white group-hover:rotate-12 transition-transform">
              <Phone fill="currentColor" size={24} />
            </div>
            <span className="text-3xl sm:text-4xl font-black text-[#8b5a2b] tracking-tight">
              +888 017xxxxxxxx
            </span>
          </motion.a>
        </motion.div>

        {/* SUBTITLE */}
        <motion.p 
          className="mt-10 text-[#C98895] text-xs font-black uppercase tracking-[0.2em] opacity-60"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          Available 24/7 for the chaos
        </motion.p>
      </section>

    </main>
  );
}