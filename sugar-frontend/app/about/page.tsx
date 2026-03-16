'use client';
import { motion, Variants } from "framer-motion";
import { Sparkles, Heart, Zap, Coffee, Utensils } from "lucide-react";
import Link from "next/link";

export default function About() {
  const funFacts = [
    { text: "Started in 2018 🍰", icon: <Heart size={18} /> },
    { text: "Only two spicy items 🌶️", icon: <Zap size={18} /> },
    { text: "Fast, friendly service 🚀", icon: <Sparkles size={18} /> },
    { text: "All desserts made with love 💖", icon: <Coffee size={18} /> },
    { text: "Honey Haze = Happiness 🧁", icon: <Utensils size={18} /> },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { 
        type: "spring", // TypeScript now infers this correctly via Variants
        stiffness: 100 
      } 
    }
  };

  return (
    <>
      <main className="relative min-h-screen bg-[#F0EBD1] flex flex-col items-center justify-start p-6 overflow-hidden font-medium selection:bg-[#C98895]/30">
        
        {/* Animated Background Elements */}
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-[#C98895]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-[#D4A24C]/10 rounded-full blur-3xl animate-pulse" />

        {/* Main Heading Section */}
        <section className="mt-32 sm:mt-40 max-w-4xl px-4 text-center space-y-12 z-10">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl sm:text-8xl font-black text-[#C98895] tracking-tighter drop-shadow-sm leading-tight">
              Honey <span className="text-[#8b5a2b]">Haze</span> Magic
            </h1>
            <div className="inline-block mt-4 px-6 py-2 bg-white/40 backdrop-blur-sm border-2 border-[#D4A24C]/20 rounded-full text-[#8b5a2b] text-xs font-black uppercase tracking-[0.3em]">
              The Aesthetic Archive
            </div>
          </motion.div>

          <div className="space-y-6">
            <motion.p
              className="text-[#8b5a2b] text-xl sm:text-2xl leading-relaxed bg-white/60 backdrop-blur-xl p-10 rounded-[3rem] shadow-[20px_20px_0_rgba(201,136,149,0.05)] border-4 border-white/80"
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              Born in <span className="text-[#C98895] font-black italic">2018</span>, Honey Haze is your cozy paradise of desserts and digital delight. 
              Only two spicy items <span className="inline-block animate-bounce">🌶️</span>, but every sweet treat is a masterpiece of chaos and cuteness.
            </motion.p>
          </div>
        </section>

        {/* Floating Fun Fact Pills */}
        <motion.section 
          className="mt-20 w-full max-w-5xl flex flex-wrap justify-center gap-4 px-4 z-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {funFacts.map((fact, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ y: -10, rotate: i % 2 === 0 ? 2 : -2 }}
              className="bg-white/80 backdrop-blur-md px-8 py-5 rounded-full shadow-[8px_8px_0_rgba(139,90,43,0.1)] border-2 border-[#D4A24C]/10 text-[#82A899] font-black text-sm uppercase tracking-wider flex items-center gap-3 cursor-default"
            >
              <span className="text-[#D4A24C]">{fact.icon}</span>
              {fact.text}
            </motion.div>
          ))}
        </motion.section>

        {/* Spicy Section - High Contrast */}
        <section className="mt-24 max-w-3xl w-full px-4 z-10">
          <motion.div 
            className="bg-[#C98895] p-1 text-white rounded-[4rem] shadow-2xl overflow-hidden"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="bg-[#C98895] border-4 border-dashed border-white/30 rounded-[3.8rem] p-12 text-center">
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter mb-4 flex items-center justify-center gap-4">
                <Zap className="fill-white" /> Legendary Spice <Zap className="fill-white" />
              </h2>
              <p className="text-white/90 text-lg font-medium italic">
                "Only two spicy items, but they’re iconic. Perfect heat, bold flavor, and a pinch of chaos that keeps the hive buzzing."
              </p>
            </div>
          </motion.div>
        </section>

        {/* CTA Section */}
        <motion.div 
  className="mt-24 mb-20 flex flex-col items-center gap-6"
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
>
  <div className="text-[10px] font-black uppercase tracking-[0.5em] text-[#D4A24C]">
    Ready for the Haze?
  </div>
  
  <Link href="/" passHref>
    <motion.button 
      className="bg-[#8b5a2b] hover:bg-[#C98895] text-white font-black py-6 px-14 rounded-full shadow-[10px_10px_0_#D4A24C] text-sm uppercase tracking-widest transition-all"
      whileHover={{ 
        scale: 1.05, 
        y: -5, 
        boxShadow: "12px 12px 0px #C98895" 
      }}
      whileTap={{ scale: 0.95 }}
    >
      Sprinkle Some Chaos ✨
    </motion.button>
  </Link>
</motion.div>

      </main>

      <style jsx global>{`
        @keyframes subtleFloating {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
        .animate-subtle { animation: subtleFloating 4s ease-in-out infinite; }
      `}</style>
    </>
  );
}