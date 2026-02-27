'use client';
import { motion } from "framer-motion";

export default function About() {

  const funFacts = [
    "Started in 2018 🍰",
    "Only two spicy items 🌶️ (but iconic!)",
    "Fast, friendly service 🚀",
    "All desserts made with love 💖",
    "Honey Haze deliveries = instant happiness 🧁",
  ];

  return (
    <>


      <main className="relative min-h-screen bg-gradient-to-b from-[#F0EBD1] to-[#FFF8E1] flex flex-col items-center justify-start p-6 text-center overflow-x-hidden">

        {/* Main Heading */}
        <section className="mt-32 sm:mt-40 max-w-4xl px-4 text-center space-y-8 z-30">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#C98895] animate-glow-bounce">
            🥞 Honey Haze Magic 🍯
          </h1>
          <motion.p
            className="text-[#82A899] text-lg sm:text-xl bg-white/50 backdrop-blur-md p-6 rounded-3xl shadow-lg relative z-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Born in <span className="font-bold">2018</span>, Honey Haze is your chaotic paradise of desserts and delight 💖. 
            Only two spicy items 🌶️, but every sweet treat 🍰 is a masterpiece of chaos and cuteness.
          </motion.p>
          <motion.p
            className="text-[#82A899] text-lg sm:text-xl bg-white/50 backdrop-blur-md p-6 rounded-3xl shadow-lg relative z-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5 }}
          >
            Why us? <span className="font-bold sparkle">Fast service</span>, <span className="font-bold sparkle">friendly faces</span>, <span className="font-bold sparkle">food that tastes as good as it looks</span>. Every order is a little adventure of sweetness and joy 🧁✨.
          </motion.p>
        </section>

        {/* Fun Fact Bubbles */}
        <section className="mt-16 w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-6 px-4 z-30">
          {funFacts.map((fact, i) => (
            <motion.div
              key={i}
              className="bg-white/50 backdrop-blur-md p-6 rounded-3xl shadow-lg text-[#82A899] font-medium text-lg flex items-center justify-center transform -rotate-[2deg] hover:rotate-[2deg] cursor-pointer"
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 + i*0.2 }}
              whileHover={{ scale: 1.05 }}
            >
              {fact}
            </motion.div>
          ))}
        </section>

        {/* Spicy Section */}
        <section className="mt-16 max-w-4xl px-4 text-center space-y-6 z-30">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#C98895] animate-wiggle">🌶️ Our Legendary Spicy Treats 🌶️</h2>
          <motion.p
            className="text-[#82A899] text-lg sm:text-xl bg-white/50 backdrop-blur-md p-6 rounded-3xl shadow-lg"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1.2 }}
          >
            Only two spicy items, but they’re iconic 🔥. Perfect heat, bold flavor, and a pinch of chaos that keeps people coming back.
          </motion.p>
        </section>

        {/* CTA */}
        <motion.button 
          className="mt-20 bg-[#D4A24C] hover:bg-[#9CAF88] text-white font-bold py-3 px-10 rounded-full shadow-lg transform hover:scale-110 transition duration-300 z-30"
          whileHover={{ rotate: [0, 5, -5, 0], scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          Sprinkle Some Chaos 💖
        </motion.button>

      </main>

      <style jsx>{`
        @keyframes glowBounceUpDown {
          0%, 100% { transform: translateY(0); text-shadow: 0 0 6px #FAF0D7, 0 0 10px #FAF0D7, 0 0 20px #FAF0D7; }
          50% { transform: translateY(-15px); text-shadow: 0 0 14px #FAF0D7, 0 0 25px #FAF0D7, 0 0 35px #FAF0D7; }
        }
        .animate-glow-bounce { animation: glowBounceUpDown 1.5s ease-in-out infinite; }
        @keyframes wiggle {
          0% { transform: rotate(0deg); }
          25% { transform: rotate(2deg); }
          50% { transform: rotate(-2deg); }
          75% { transform: rotate(1deg); }
          100% { transform: rotate(0deg); }
        }
        .animate-wiggle { animation: wiggle 2s ease-in-out infinite; }
        .sparkle { position: relative; }
        .sparkle::after {
          content: "✨";
          position: absolute;
          top: -5px;
          right: -5px;
          font-size: 0.8rem;
          opacity: 0.7;
          animation: sparkleAnim 1.5s infinite;
        }
        @keyframes sparkleAnim {
          0% { opacity: 0.3; transform: scale(0.8) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.2) rotate(20deg); }
          100% { opacity: 0.3; transform: scale(0.8) rotate(0deg); }
        }
      `}</style>
    </>
  );
}
