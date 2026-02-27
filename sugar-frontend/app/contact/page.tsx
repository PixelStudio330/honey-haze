'use client';
import { motion } from "framer-motion";

export default function Helpline() {
  const icons = [
    { icon: "📞", top: "10%", left: "15%" },
    { icon: "🌸", top: "30%", left: "70%" },
    { icon: "✨", top: "60%", left: "40%" },
    { icon: "🥨", top: "80%", left: "20%" },
  ];

  return (
    <section className="relative bg-[#F0EBD1] min-h-screen flex flex-col items-center justify-center text-center overflow-hidden">
      
      {/* FLOATING ICONS */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {icons.map((item, i) => (
          <motion.div
            key={i}
            className="absolute text-5xl opacity-30"
            style={{ top: item.top, left: item.left }}
            animate={{
              y: [0, 10, 0],
              x: [-5, 5, -5],
              rotate: [0, 15, 0, -15],
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          >
            {item.icon}
          </motion.div>
        ))}
      </div>

      {/* HEADER */}
      <motion.h2
        className="text-5xl sm:text-6xl font-extrabold text-[#C98895] mb-0"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
      >
        Need Assistance? 📞
      </motion.h2>

      <p className="text-[#8A5559] text-lg sm:text-xl mb-10 sm:w-2/3">
        Call our helpline anytime. We’re always here for you! 💖✨
      </p>

      {/* PHONE NUMBER */}
      <motion.a
        href="tel:+1234567890"
        className="text-4xl sm:text-5xl font-bold text-[#D4A24C] bg-white/70 backdrop-blur-md px-8 py-4 rounded-3xl shadow-lg hover:scale-105 transition-transform duration-300"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1 }}
      >
        +888 017xxxxxxxx
      </motion.a>

    </section>
  );
}
