'use client';
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Cart, { CartItem } from "./components/Cart";

// 🌸 BACKUP DATA
const backupFoods: FoodItem[] = [
  { id: 1, name: "Honey Glazed Donut", price: 120, type: "sweet", description: "Soft, fluffy, and dripping with organic honey.", image: "/images/donut.jpg" },
  { id: 2, name: "Spicy Naga Pasta", price: 350, type: "spicy", description: "Extreme heat for the brave souls.", image: "/images/pasta.jpg" },
  { id: 3, name: "Strawberry Shortcake", price: 450, type: "sweet", description: "Freshly picked strawberries and cream.", image: "/images/cake.jpg" },
  { id: 4, name: "Chili Cheese Fries", price: 250, type: "spicy", description: "Loaded with jalapenos and melted cheddar.", image: "/images/fries.jpg" },
];

interface FoodItem {
  id: number;
  name: string;
  price?: number;
  type: string;
  description: string;
  image: string;
}

export default function Home() {
  const [hasMounted, setHasMounted] = useState(false);
  const [filter, setFilter] = useState("all");
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  
  // NEW: State to track if an order is currently active
  const [isOrdered, setIsOrdered] = useState(false);

  useEffect(() => {
    setHasMounted(true); 
    async function loadFoods() {
      try {
        const res = await fetch("/api/foods");
        const contentType = res.headers.get("content-type");
        if (!res.ok || !contentType || !contentType.includes("application/json")) {
          throw new Error("API returned non-JSON response");
        }
        const data = await res.json();
        setFoods(Array.isArray(data) && data.length > 0 ? data : backupFoods);
      } catch (err) {
        console.warn("Neon DB unreachable. Using local backup menu. 🌸", err);
        setFoods(backupFoods);
      } finally {
        setLoading(false);
      }
    }
    loadFoods();
  }, []);

  const removeFromCart = (id: string) => {
    if (isOrdered) return; // Prevent removal during delivery
    setCart(prev => prev.filter(item => item._id !== id));
  };

  const addToCart = (item: FoodItem) => {
    // Prevent adding if an order is already placed
    if (isOrdered) {
      setNotification("Finish your current order first! 🛵");
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    const foodIdStr = String(item.id);
    const itemPrice = item.price || 150;

    setCart(prev => {
      const existingItem = prev.find(f => f.foodId === foodIdStr);
      if (existingItem) {
        return prev.map(f => f.foodId === foodIdStr ? { ...f, qty: f.qty + 1 } : f);
      }
      return [...prev, {
        _id: crypto.randomUUID(),
        foodId: foodIdStr,
        name: item.name,
        price: itemPrice,
        image: item.image,
        qty: 1,
      }];
    });

    setNotification(`${item.name} added to bag!🍓`);
    setTimeout(() => setNotification(null), 4000);
  };

  const filteredFoods = filter === "all" ? foods : foods.filter(f => f.type === filter);
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const bgIcons = [
    { icon: "🍰", top: "8%", left: "12%" },
    { icon: "🍞", top: "10%", left: "80%" },
    { icon: "🍓", top: "50%", left: "15%" },
    { icon: "🍩", top: "45%", left: "92%" },
    { icon: "🥐", top: "85%", left: "18%" },
    { icon: "🍪", top: "88%", left: "85%" },
  ];

  if (!hasMounted) return <div className="min-h-screen bg-[#F0EBD1]" />;

  return (
    <main className="relative min-h-screen bg-[#F0EBD1] flex flex-col items-center justify-start p-6 text-center overflow-x-hidden">
      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 20 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 z-[100] ${isOrdered ? 'bg-orange-500' : 'bg-[#82A899]'} text-white px-6 py-3 rounded-full font-bold shadow-lg border-2 border-white flex items-center gap-2`}
          >
            <span>{isOrdered ? "⚠️" : "✅"}</span> {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div className="relative w-screen h-[400px] md:h-[500px] flex flex-col items-center justify-center z-10">
        <Image src="/images/new-hero.jpg" alt="Hero" fill className="object-cover" priority unoptimized />
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
          <motion.h1
            className="text-5xl sm:text-7xl font-extrabold"
            style={{ color: '#FFD700', textShadow: '2px 2px 10px rgba(0,0,0,0.5)' }}
            animate={{ y: [-3, 3, -3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            🥞 Honey Haze 🍯
          </motion.h1>
          <p className="mt-4 text-lg sm:text-2xl text-white font-bold drop-shadow-md italic">
            delicious food, fast service, zero regrets 🍭
          </p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="z-10 flex gap-4 mt-8 mb-6">
        {["all", "sweet", "spicy"].map((type) => (
          <button
            key={`filter-${type}`}
            onClick={() => setFilter(type)}
            className={`px-6 py-2 rounded-full font-bold transition-all shadow-md active:scale-95 ${
              filter === type ? "bg-[#D4A24C] text-white" : "bg-white text-[#8A5559] border-2 border-[#D4A24C]"
            }`}
          >
            {type === "all" ? "🍞 All" : type === "sweet" ? "🍰 Sweet" : "🌶 Spicy"}
          </button>
        ))}
      </div>

      {/* Food Grid */}
      <section className="z-10 w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4 pb-20">
        {loading ? (
          <div className="col-span-full py-20 text-2xl font-bold text-[#8A5559] animate-pulse">Baking the magic... 🌸</div>
        ) : (
          filteredFoods.map((food) => (
            <motion.div
              key={`food-card-${food.id}`}
              layout
              className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden border-4 border-[#8A5559] flex flex-col"
              whileHover={!isOrdered ? { y: -5 } : {}}
            >
              <div className="relative w-full h-48">
                <Image src={food.image || "/images/logo.jpg"} alt={food.name} fill className="object-cover" unoptimized />
                {isOrdered && (
                  <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="bg-[#8A5559] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Locked</span>
                  </div>
                )}
              </div>
              <div className="p-5 flex flex-col flex-grow text-left">
                <h3 className="text-lg font-black text-[#C98895] uppercase">{food.name}</h3>
                <p className="text-xs text-[#82A899] font-bold mt-1 mb-4 line-clamp-2">{food.description}</p>
                <div className="flex items-center justify-between mt-auto">
                   <span className="text-lg font-black text-[#D4A24C]">৳ {food.price}</span>
                   <button
                    onClick={() => addToCart(food)}
                    disabled={isOrdered}
                    className={`font-black py-2 px-4 rounded-full text-xs shadow-md transition-all active:scale-90 ${
                      isOrdered 
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                        : "bg-[#D4A24C] hover:bg-[#C98895] text-white"
                    }`}
                  >
                    {isOrdered ? "ON WAY 🛵" : "ADD +"}
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </section>

      {/* Floating Cart Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setCartOpen(true)}
        className={`fixed bottom-8 right-8 z-[50] text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 font-black ring-4 ring-white ${
          isOrdered ? "bg-[#90be6d]" : "bg-[#D4A24C]"
        }`}
      >
        <span className="text-xl">{isOrdered ? "🛵" : "🛒"}</span>
        <motion.span 
          key={cartCount}
          initial={{ scale: 1.5 }}
          animate={{ scale: 1 }}
          className={`px-2 py-0.5 rounded-lg text-sm ${isOrdered ? 'bg-white text-[#90be6d]' : 'bg-white text-[#D4A24C]'}`}
        >
          {isOrdered ? "TRACK" : cartCount}
        </motion.span>
      </motion.button>

      {/* Updated Cart Drawer with Order State */}
      <Cart
        cart={cart}
        cartOpen={cartOpen}
        setCartOpen={setCartOpen}
        setCart={setCart}
        removeFromCart={removeFromCart}
        total={total}
        isOrdered={isOrdered}
        setIsOrdered={setIsOrdered}
      />
    </main>
  );
}