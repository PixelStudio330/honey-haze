'use client';
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

type Offer = {
  id: number;
  title: string;
  description: string;
  image: string;
  imageLeft: boolean;
};

export default function Offers() {
  const [timeLeft, setTimeLeft] = useState(0);

  const offers: Offer[] = [
    {
      id: 1,
      title: "Sweet Treat Bundle 🍰",
      description: "Get 3 cupcakes + 1 donut free! Only for chaotic souls .",
      image: "/images/offers/sweet-treats.jpg",
      imageLeft: true,
    },
    {
      id: 2,
      title: "Sugar Magic Box ✨",
      description: "Mystery box with sweet surprises! Resets every 48 hours .",
      image: "/images/offers/mystery-offer.jpg",
      imageLeft: false,
    },
    {
      id: 3,
      title: "Coffee + Cookie Combo ☕🍪",
      description: "Grab your favorite cookie with any coffee, 2-day special .",
      image: "/images/offers/cookie.jpg",
      imageLeft: true,
    },
  ];

  // 48-hour countdown
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const resetInterval = 48 * 60 * 60 * 1000; // 48h
      const start = new Date("2025-11-01T00:00:00").getTime();
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
    return `${hours.toString().padStart(2,"0")}:${minutes.toString().padStart(2,"0")}:${seconds.toString().padStart(2,"0")}`;
  };

  return (
    <section className="py-60 bg-[#F0EBD1] flex flex-col items-center gap-15">
      <h1 className="text-5xl sm:text-6xl font-extrabold text-[#C98895] text-center mb-16">
  🌸 This Week's Special Offers 🌸
</h1>

      <div className="flex flex-col gap-12 w-full max-w-6xl px-6">
        {offers.map((offer) => (
          <motion.div
            key={offer.id}
            className="flex flex-col md:flex-row items-center bg-white/90 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: offer.id * 0.2 }}
          >
            {/* Left Image */}
            {offer.imageLeft && (
              <img
                src={offer.image}
                alt={offer.title}
                className="w-full md:w-1/2 object-cover h-64 md:h-auto"
              />
            )}

            {/* Content */}
            <div className="flex flex-col justify-center p-8 md:w-1/2 gap-4">
              {/* Timer above title */}
              <div className="self-start bg-[#D4A24C]/70 backdrop-blur-md px-4 py-1 rounded-full font-bold text-white shadow-md text-lg mb-2">
                ⏱ {formatTime(timeLeft)}
              </div>

              <h2 className="text-3xl font-extrabold text-[#C98895]">{offer.title}</h2>
              <p className="text-[#8A5559] text-lg">{offer.description}</p>
            </div>

            {/* Right Image */}
            {!offer.imageLeft && (
              <img
                src={offer.image}
                alt={offer.title}
                className="w-full md:w-1/2 object-cover h-64 md:h-auto"
              />
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
