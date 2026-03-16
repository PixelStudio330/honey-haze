'use client';
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, ReceiptText, Trash2, LogIn, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";

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
  const { data: session } = useSession();
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);
  const [filter, setFilter] = useState("all");
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'auth' } | null>(null);
  
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
    if (!session) {
      setNotification({ message: "Want to order? Sign in! ૮₍ ˶ᵔ ᵕ ᵔ˶ ₎ა", type: 'auth' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

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

    setNotification({ message: `${item.name} added!🍓`, type: 'success' });
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
    <main className="relative min-h-screen bg-[#F0EBD1] flex flex-col items-center justify-start text-center overflow-x-hidden">
      
      {/* 🛍️ FLOATY BAG SUMMARY */}
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
          <motion.div 
            initial={{ opacity: 0, y: -50 }} 
            animate={{ opacity: 1, y: 100 }} 
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 z-[110] px-6 py-3 rounded-full font-bold shadow-lg border-2 border-white flex items-center gap-4 ${
              notification.type === 'auth' ? 'bg-[#C98895]' : 'bg-[#82A899]'
            } text-white`}
          >
            <span className="flex items-center gap-2">
              {notification.type === 'auth' ? '🍯' : '✅'} {notification.message}
            </span>
            {notification.type === 'auth' && (
              <button 
                onClick={() => router.push('/login')}
                className="bg-white text-[#C98895] px-4 py-1 rounded-full text-xs font-black uppercase flex items-center gap-1 hover:bg-[#FDF6F8] transition-colors"
              >
                <LogIn size={12} /> Sign In
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🥞 HERO SECTION */}
      <div className="relative w-full h-[500px] md:h-[650px] flex flex-col items-center justify-start z-0 overflow-hidden">
        <Image 
          src="/images/new-hero.jpg" 
          alt="Hero" 
          fill 
          className="object-cover" 
          priority 
          unoptimized 
        />
        
        {/* 🌊 INTENSE SPIRAL WAVES (NO LOOP-BACKS) */}
        <div className="absolute bottom-0 left-0 w-full z-10 translate-y-[4px]">
          <svg 
            viewBox="0 0 1440 160" 
            className="w-full h-auto block scale-[1.03] origin-bottom" 
            preserveAspectRatio="none"
          >
            {/* The colored accent border path - High Intensity */}
            <path 
              fill="#C98895" 
              d="M0,80 C180,160 360,0 540,80 C720,160 900,0 1080,80 C1260,160 1440,0 1440,80 V100 C1440,20 1260,180 1080,100 C900,20 720,180 540,100 C360,20 180,180 0,100 Z"
            ></path>
            {/* The main background fill path - High Intensity */}
            <path 
              fill="#F0EBD1" 
              d="M0,95 C180,175 360,15 540,95 C720,175 900,15 1080,95 C1260,175 1440,15 1440,95 V165 H0 Z"
            ></path>
          </svg>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-start pt-32 md:pt-44 text-center px-8 bg-black/10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <motion.h1 
              className="text-7xl sm:text-9xl font-black tracking-tighter" 
              style={{ 
                color: '#FFD700', 
                filter: 'drop-shadow(6px 6px 0px #8A5559)'
              }}
              animate={{ 
                y: [0, -10, 0],
                rotate: [-0.5, 0.5, -0.5]
              }} 
              transition={{ 
                duration: 5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              Honey Haze
            </motion.h1>
            
            <motion.div 
              className="mt-4 flex items-center gap-2"
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <p className="text-sm sm:text-xl text-white font-black uppercase tracking-[0.3em] flex items-center gap-3 drop-shadow-md">
                <Sparkles size={18} className="text-[#FFD700]" />
                Delicious magic in every bite
                <Sparkles size={18} className="text-[#FFD700]" />
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full flex flex-col items-center px-6 -mt-1 relative z-20 bg-[#F0EBD1]">
        {/* 🏷️ FILTER BUTTONS */}
        <div className="flex gap-5 mb-16 pt-10">
            {["all", "sweet", "spicy"].map((type) => (
            <button key={type} onClick={() => setFilter(type)}
                className={`px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-[8px_8px_0_#8A5559] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none border-[3px] border-[#8A5559] ${
                filter === type ? "bg-[#D4A24C] text-white" : "bg-white text-[#8A5559]"
                }`}
            >
                {type === "all" ? "🍞 All" : type === "sweet" ? "🍰 Sweet" : "🌶 Spicy"}
            </button>
            ))}
        </div>

        {/* 🍕 FOOD GRID */}
        <section className="w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 pb-40">
            {loading ? (
            <div className="col-span-full py-24 text-3xl font-black text-[#8A5559] animate-pulse">Baking magic... ✨</div>
            ) : (
            filteredFoods.map((food) => {
                const inCart = cartItems.find(f => f.foodId === String(food.id));
                return (
                <motion.div 
                  key={food.id} 
                  layout 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -12 }}
                  className="bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border-[6px] border-[#8A5559] flex flex-col group"
                >
                    <div className="relative w-full h-72 overflow-hidden border-b-[6px] border-[#8A5559]">
                      <Image 
                        src={food.image || "/images/logo.jpg"} 
                        alt={food.name} 
                        fill 
                        className="object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1" 
                        unoptimized 
                      />
                      <div className="absolute top-6 left-6 bg-[#FFE6ED] px-5 py-2 rounded-full border-[3px] border-[#8A5559] text-xs font-black uppercase text-[#8A5559] shadow-sm">
                        {food.type}
                      </div>
                    </div>

                    <div className="p-10 flex flex-col flex-grow text-left">
                      <h3 className="text-3xl font-black text-[#C98895] uppercase leading-tight mb-4 group-hover:text-[#D4A24C] transition-colors">{food.name}</h3>
                      <p className="text-base text-[#82A899] font-bold mb-10 line-clamp-2 leading-relaxed opacity-90">
                        {food.description}
                      </p>
                      
                      <div className="flex items-center justify-between mt-auto">
                          <span className="text-3xl font-black text-[#8A5559]">৳{food.price}</span>
                          
                          {!inCart ? (
                            <button 
                              onClick={() => addToCart(food)} 
                              className="bg-[#82A899] hover:bg-[#C98895] text-white font-black py-4 px-10 rounded-2xl text-sm shadow-[6px_6px_0_#8A5559] transition-all active:scale-95 border-2 border-[#8A5559]"
                            >
                                ADD +
                            </button>
                          ) : (
                            <div className="flex items-center gap-3">
                                <div className="flex items-center bg-[#FDFCF0] border-[3px] border-[#8A5559] rounded-2xl overflow-hidden shadow-sm">
                                  <button onClick={() => changeQty(inCart.foodId, -1)} className="px-4 py-2 hover:bg-[#FFE6ED] text-[#8A5559] transition-colors"><Minus size={16} strokeWidth={4} /></button>
                                  <input 
                                      type="number" 
                                      value={inCart.qty} 
                                      onFocus={(e) => handleManualQty(inCart.foodId, "")}
                                      onBlur={(e) => handleBlur(inCart.foodId, e.target.value)}
                                      onChange={(e) => handleManualQty(inCart.foodId, e.target.value)}
                                      className="w-12 text-center font-black text-lg text-[#8A5559] bg-transparent focus:outline-none" 
                                  />
                                  <button onClick={() => changeQty(inCart.foodId, 1)} className="px-4 py-2 hover:bg-[#FFE6ED] text-[#8A5559] transition-colors"><Plus size={16} strokeWidth={4} /></button>
                                </div>
                                <button 
                                  onClick={() => removeFromCart(inCart.foodId)}
                                  className="p-4 bg-[#FFE6ED] text-[#8A5559] border-[3px] border-[#8A5559] rounded-2xl hover:bg-[#8A5559] hover:text-white transition-all shadow-sm"
                                >
                                  <Trash2 size={24} />
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