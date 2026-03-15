'use client';
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, ReceiptText, Trash2 } from "lucide-react";

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
  const [notification, setNotification] = useState<string | null>(null);
  
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);

  useEffect(() => {
    setHasMounted(true); 
    syncCart();

    async function loadFoods() {
      try {
        const res = await fetch("/api/foods");
        const data = await res.json();
        setFoods(Array.isArray(data) && data.length > 0 ? data : backupFoods);
      } catch (err) {
        setFoods(backupFoods);
      } finally {
        setLoading(false);
      }
    }
    loadFoods();

    window.addEventListener("storage", syncCart);
    return () => window.removeEventListener("storage", syncCart);
  }, []);

  const syncCart = () => {
    const saved = localStorage.getItem("honey_haze_cart");
    setCartItems(saved ? JSON.parse(saved) : []);
  };

  const updateCart = (newCart: any[]) => {
    setCartItems(newCart);
    localStorage.setItem("honey_haze_cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("storage"));
  };

  const addToCart = (item: FoodItem) => {
    let currentCart = [...cartItems];
    const foodIdStr = String(item.id);
    const existingIndex = currentCart.findIndex((f: any) => f.foodId === foodIdStr);
    
    if (existingIndex > -1) {
      currentCart[existingIndex].qty += 1;
    } else {
      currentCart.push({
        _id: crypto.randomUUID(),
        foodId: foodIdStr,
        name: item.name,
        price: item.price || 150,
        image: item.image,
        qty: 1,
      });
    }

    updateCart(currentCart);

    if (!hasOpenedOnce) {
      window.dispatchEvent(new CustomEvent("open-cart"));
      setHasOpenedOnce(true);
    }

    setNotification(`${item.name} added!🍓`);
    setTimeout(() => setNotification(null), 2000);
  };

  const changeQty = (foodId: string, delta: number) => {
    const currentCart = [...cartItems];
    const idx = currentCart.findIndex(f => f.foodId === foodId);
    if (idx === -1) return;

    currentCart[idx].qty += delta;
    if (currentCart[idx].qty <= 0) {
      currentCart.splice(idx, 1);
    }
    updateCart(currentCart);
  };

  const removeFromCart = (foodId: string) => {
    const currentCart = cartItems.filter(f => f.foodId !== foodId);
    updateCart(currentCart);
  };

  const handleManualQty = (foodId: string, val: string) => {
    const currentCart = [...cartItems];
    const idx = currentCart.findIndex(f => f.foodId === foodId);
    if (idx === -1) return;

    if (val === "") {
        currentCart[idx].qty = ""; 
    } else {
        const num = parseInt(val);
        currentCart[idx].qty = isNaN(num) ? 1 : num;
    }
    updateCart(currentCart);
  };

  const handleBlur = (foodId: string, currentVal: any) => {
    if (currentVal === "" || currentVal <= 0) {
        const currentCart = [...cartItems];
        const idx = currentCart.findIndex(f => f.foodId === foodId);
        if (idx !== -1) {
            currentCart[idx].qty = 1; 
            updateCart(currentCart);
        }
    }
  };

  const filteredFoods = filter === "all" ? foods : foods.filter(f => f.type === filter);
  const total = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);

  if (!hasMounted) return <div className="min-h-screen bg-[#F0EBD1]" />;

  return (
    /* REMOVED pt-24 to let hero touch the top */
    <main className="relative min-h-screen bg-[#F0EBD1] flex flex-col items-center justify-start text-center overflow-x-hidden">
      
      <AnimatePresence>
        {cartItems.length > 0 && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            onClick={() => window.dispatchEvent(new CustomEvent("open-cart"))}
            className="fixed bottom-24 right-8 z-[50] w-64 bg-white border-[3px] border-[#8A5559] rounded-2xl shadow-[6px_6px_0_#8A5559] cursor-pointer overflow-hidden flex flex-col max-h-48"
          >
            <div className="bg-[#FFE6ED] p-2 border-b-2 border-[#8A5559] flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-[#8A5559]">
                <ReceiptText size={14} /> Bag Summary
              </div>
              <span className="text-[10px] font-black text-[#D4A24C]">৳ {total.toLocaleString()}</span>
            </div>
            <div className="overflow-y-auto p-2 space-y-2">
              {cartItems.map((item) => (
                <div key={item._id} className="flex items-center justify-between gap-2 border-b border-gray-100 pb-1">
                  <div className="flex items-center gap-2 truncate">
                    <img src={item.image} className="w-6 h-6 rounded object-cover" />
                    <span className="text-[9px] font-bold text-[#1a120b] truncate">{item.name}</span>
                  </div>
                  <span className="text-[9px] font-black text-[#8A5559] shrink-0">x{item.qty}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notification && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 100 }} exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 z-[110] bg-[#82A899] text-white px-6 py-3 rounded-full font-bold shadow-lg border-2 border-white flex items-center gap-2"
          >
            ✅ {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section - UPDATED: Cleaned container, removed rounded corners and max-width for top-flush fit */}
      <div className="relative w-full h-[450px] md:h-[600px] flex flex-col items-center justify-center z-0 overflow-hidden">
        <Image 
          src="/images/new-hero.jpg" 
          alt="Hero" 
          fill 
          className="object-cover" 
          priority 
          unoptimized 
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 bg-transparent">
          <motion.h1 className="text-5xl sm:text-7xl font-extrabold" style={{ color: '#FFD700', textShadow: '4px 4px 20px rgba(0,0,0,0.6)' }}
            animate={{ y: [-3, 3, -3] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
            🥞 Honey Haze 🍯
          </motion.h1>
          <p className="mt-4 text-lg sm:text-2xl text-white font-bold drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)] italic">delicious food, fast service, zero regrets 🍭</p>
        </div>
      </div>

      {/* Content wrapper for padding */}
      <div className="w-full flex flex-col items-center px-6">
        <div className="z-10 flex gap-4 mt-8 mb-6">
            {["all", "sweet", "spicy"].map((type) => (
            <button key={type} onClick={() => setFilter(type)}
                className={`px-6 py-2 rounded-full font-bold transition-all shadow-md active:scale-95 ${
                filter === type ? "bg-[#D4A24C] text-white" : "bg-white text-[#8A5559] border-2 border-[#D4A24C]"
                }`}
            >
                {type === "all" ? "🍞 All" : type === "sweet" ? "🍰 Sweet" : "🌶 Spicy"}
            </button>
            ))}
        </div>

        <section className="z-10 w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-20">
            {loading ? (
            <div className="col-span-full py-20 text-2xl font-bold text-[#8A5559] animate-pulse">Baking the magic... 🌸</div>
            ) : (
            filteredFoods.map((food) => {
                const inCart = cartItems.find(f => f.foodId === String(food.id));
                return (
                <motion.div key={food.id} layout className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden border-4 border-[#8A5559] flex flex-col" whileHover={{ y: -5 }}>
                    <div className="relative w-full h-48">
                    <Image src={food.image || "/images/logo.jpg"} alt={food.name} fill className="object-cover" unoptimized />
                    </div>
                    <div className="p-5 flex flex-col flex-grow text-left">
                    <h3 className="text-lg font-black text-[#C98895] uppercase">{food.name}</h3>
                    <p className="text-xs text-[#82A899] font-bold mt-1 mb-4 line-clamp-2">{food.description}</p>
                    <div className="flex items-center justify-between mt-auto">
                        <span className="text-lg font-black text-[#D4A24C]">৳ {food.price}</span>
                        
                        {!inCart ? (
                        <button onClick={() => addToCart(food)} className="bg-[#D4A24C] hover:bg-[#C98895] text-white font-black py-2 px-4 rounded-full text-xs shadow-md transition-all active:scale-90">
                            ADD +
                        </button>
                        ) : (
                        <div className="flex items-center gap-2">
                            <div className="flex items-center bg-[#fdfcf0] border-2 border-[#8A5559] rounded-xl overflow-hidden">
                            <button onClick={() => changeQty(inCart.foodId, -1)} className="px-2 py-1 hover:bg-[#FFE6ED] text-[#8A5559] transition-colors"><Minus size={14} strokeWidth={3} /></button>
                            <input 
                                type="number" 
                                value={inCart.qty} 
                                onFocus={(e) => handleManualQty(inCart.foodId, "")}
                                onBlur={(e) => handleBlur(inCart.foodId, e.target.value)}
                                onChange={(e) => handleManualQty(inCart.foodId, e.target.value)}
                                className="w-8 text-center font-black text-xs text-[#1a120b] bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                            />
                            <button onClick={() => changeQty(inCart.foodId, 1)} className="px-2 py-1 hover:bg-[#FFE6ED] text-[#8A5559] transition-colors"><Plus size={14} strokeWidth={3} /></button>
                            </div>
                            <button 
                            onClick={() => removeFromCart(inCart.foodId)}
                            className="p-2 bg-[#FFE6ED] text-[#8A5559] border-2 border-[#8A5559] rounded-xl hover:bg-[#8A5559] hover:text-white transition-all shadow-sm active:scale-90"
                            >
                            <Trash2 size={16} />
                            </button>
                        </div>
                        )}
                    </div>
                    </div>
                </motion.div>
                )
            })
            )}
        </section>
      </div>
    </main>
  );
}