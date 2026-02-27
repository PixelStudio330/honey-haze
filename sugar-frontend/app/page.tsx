'use client';
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Cart, { CartItem } from "./components/Cart";

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

  useEffect(() => {
    setHasMounted(true); 
    fetch("/api/foods")
      .then(res => res.json())
      .then(data => {
        setFoods(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item._id !== id));
  };

  const addToCart = (item: FoodItem) => {
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
      
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 20 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 z-[100] bg-[#82A899] text-white px-6 py-3 rounded-full font-bold shadow-lg border-2 border-white flex items-center gap-2"
          >
            <span>✅</span> {notification}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 pointer-events-none z-[20]">
        {bgIcons.map((item, i) => (
          <motion.div
            key={`bg-icon-${i}`}
            className="absolute text-5xl"
            style={{ top: item.top, left: item.left, opacity: 0.35 }}
            animate={{ y: [0, 10, 0], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 5 + (i % 4), repeat: Infinity, ease: "easeInOut" }}
          >
            {item.icon}
          </motion.div>
        ))}
      </div>

      <div className="relative w-screen h-[500px] md:h-[600px] flex flex-col items-center justify-center z-10">
        {/* FIX: Updated path to match your folder and added unoptimized */}
        <Image 
          src="/images/new-hero.jpg" 
          alt="Hero" 
          fill 
          className="object-cover" 
          priority 
          unoptimized 
        />
        <div className="absolute inset-0 bg-black/25 backdrop-blur-[1px]" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
          <motion.h1
            className="text-6xl sm:text-7xl font-extrabold relative"
            style={{
              color: '#FFD700',
              textShadow: '0 0 15px rgba(245, 245, 220, 0.4), 0 0 30px rgba(210, 180, 140, 0.2)', 
            }}
            animate={{ 
              y: [-4, 4, -4],
              filter: [
                "drop-shadow(0 0 8px rgba(245, 245, 220, 0.3))",
                "drop-shadow(0 0 18px rgba(210, 180, 140, 0.4))",
                "drop-shadow(0 0 8px rgba(245, 245, 220, 0.3))"
              ] 
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="relative inline-block">
              🥞 Honey Haze 🍯
            </span>
          </motion.h1>

          <p className="mt-6 text-lg sm:text-2xl text-white font-semibold drop-shadow-md italic">
            delicious food, fast service, zero regrets 🍭
          </p>
        </div>
      </div>

      <div className="z-10 flex gap-4 mt-10 mb-6">
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

      <section className="z-10 w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 px-4">
        {loading ? (
          <div className="col-span-full py-20 text-2xl font-bold text-[#8A5559]">Baking the magic... 🌸</div>
        ) : filteredFoods.length === 0 ? (
          <p className="text-xl font-bold col-span-full">No foods found 😢</p>
        ) : (
          filteredFoods.map((food) => (
            <motion.div
              key={`food-card-${food.id}`}
              layout
              className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden border-4 border-[#8A5559] flex flex-col"
              whileHover={{ scale: 1.03 }}
            >
              <div className="relative w-full h-64">
                <Image 
                  src={food.image || "/images/logo.jpg"} 
                  alt={food.name} 
                  fill 
                  className="object-cover" 
                  unoptimized 
                />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-black text-[#C98895] mb-2 uppercase">{food.name}</h3>
                <p className="text-sm text-[#82A899] font-medium mb-4 line-clamp-2">{food.description}</p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-dashed border-[#8A5559]/20">
                   <span className="text-xl font-black text-[#D4A24C]">৳ {food.price || 150}</span>
                   <button
                    onClick={() => addToCart(food)}
                    className="bg-[#D4A24C] hover:bg-[#C98895] text-white font-bold py-2 px-5 rounded-full shadow-md transition-colors"
                  >
                    Add +
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </section>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setCartOpen(true)}
        className="fixed bottom-8 right-8 z-[50] bg-[#D4A24C] text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 font-black ring-4 ring-white"
      >
        <span className="text-xl">🛒</span>
        <motion.span 
          key={cartCount}
          initial={{ scale: 1.5 }}
          animate={{ scale: 1 }}
          className="bg-white text-[#D4A24C] px-2 py-0.5 rounded-lg text-sm"
        >
          {cartCount}
        </motion.span>
      </motion.button>

      <Cart
        cart={cart}
        cartOpen={cartOpen}
        setCartOpen={setCartOpen}
        setCart={setCart}
        removeFromCart={removeFromCart}
        total={total}
      />
    </main>
  );
}