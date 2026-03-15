"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Minus, Plus, X, MapPin, Loader2, Navigation, Trash2, User, Phone } from "lucide-react";
import { useRouter } from "next/navigation";

export interface CartItem {
  _id: string;
  foodId: string;
  name: string;
  price: number;
  qty: number;
  image: string;
}

// Fixed Interface: Added isOrdered and setIsOrdered to match layout.tsx
interface CartProps {
  cart: CartItem[];
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  total: number;
  isOrdered: boolean;
  setIsOrdered: React.Dispatch<React.SetStateAction<boolean>>;
}

function LocationSearch({ onSelect }: { onSelect: (addr: string, lat: number, lon: number) => void }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (isSelected || query.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=bd&limit=6`);
        const data = await res.json();
        setSuggestions(data);
        setShowDropdown(true);
      } catch (err) {
        console.error(err);
      }
    }, 400); 
    return () => clearTimeout(timer);
  }, [query, isSelected]);

  const handleGPS = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          const addr = data.display_name || "Pinned Location";
          setQuery(addr);
          onSelect(addr, latitude, longitude);
          setIsSelected(true);
        } catch {
          setQuery("📍 Current GPS Location");
          onSelect("Exact GPS Location", latitude, longitude);
        }
        setLocating(false);
      },
      () => {
        alert("Please allow location access for exact delivery.");
        setLocating(false);
      }
    );
  };

  return (
    <div className="relative space-y-2">
      <div className="flex justify-between items-center ml-1">
        <label className="text-[10px] font-black text-[#1a120b] uppercase tracking-tighter">Delivery Address</label>
        <button onClick={handleGPS} className="text-[9px] font-black text-[#CF7486] uppercase flex items-center gap-1 hover:scale-105 transition-transform">
          {locating ? <Loader2 size={10} className="animate-spin" /> : <Navigation size={10} />}
          Exact GPS
        </button>
      </div>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a321a]" size={16} />
        <input
          type="text"
          placeholder="Search (e.g. Jahangirnagar)..."
          value={query}
          onChange={(e) => { 
            setQuery(e.target.value); 
            setIsSelected(false);
            onSelect(e.target.value, 0, 0); 
          }}
          className="w-full pl-10 pr-10 py-3 bg-[#fdfcf0] border-2 border-[#8b5a2b] rounded-xl text-xs font-bold focus:outline-none text-[#1a120b] placeholder:text-[#1a120b]/50"
        />
      </div>
      {showDropdown && (
        <div className="absolute z-[10001] w-full bg-white border-2 border-[#8b5a2b] rounded-2xl shadow-xl mt-1 max-h-40 overflow-y-auto">
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => { onSelect(s.display_name, parseFloat(s.lat), parseFloat(s.lon)); setQuery(s.display_name); setIsSelected(true); setShowDropdown(false); }} className="w-full text-left px-4 py-2 text-[10px] font-bold border-b border-gray-100 last:border-0 hover:bg-[#FFE6ED] text-[#1a120b]">
              {s.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Added isOrdered and setIsOrdered to the component props
export default function Cart({ cart, cartOpen, setCartOpen, setCart, total, isOrdered, setIsOrdered }: CartProps) {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [coords, setCoords] = useState<[number, number] | null>(null);

  const bdPhoneRegex = /^01[3-9]\d{8}$/;
  const isFormValid = address.trim().length > 5 && customerName.trim().length > 2 && bdPhoneRegex.test(phoneNumber);

  useEffect(() => {
    const handleOpen = () => setCartOpen(true);
    window.addEventListener("open-cart", handleOpen);
    return () => window.removeEventListener("open-cart", handleOpen);
  }, [setCartOpen]);

  const syncAndSave = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("honey_haze_cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("storage"));
  };

  const updateQty = (id: string, val: number) => {
    const newCart = cart.map((item) => (item._id === id ? { ...item, qty: val } : item));
    syncAndSave(newCart);
  };

  const removeItem = (id: string) => {
    const newCart = cart.filter(item => item._id !== id);
    syncAndSave(newCart);
  };

  const clearCart = () => {
    if (confirm("Are you sure you want to clear your bag?")) {
      syncAndSave([]);
    }
  };

  const handleCheckout = () => {
    if (!isFormValid) return;

    const finalCoords = coords && coords[0] !== 0 ? coords : [23.8103, 90.4125]; 
    const newOrder = {
      id: `HH-${Math.floor(Date.now() / 100000)}`,
      items: [...cart],
      total: total,
      customerName: customerName,
      phoneNumber: phoneNumber,
      address: address.trim() || "Specified Location",
      coords: finalCoords,
      startTime: Date.now(),
    };
    
    const existing = JSON.parse(localStorage.getItem("honey_haze_orders") || "[]");
    localStorage.setItem("honey_haze_orders", JSON.stringify([newOrder, ...existing]));
    
    // Set order state if needed for UI feedback
    setIsOrdered(true);
    syncAndSave([]); 
    setCartOpen(false); 
    router.push("/order-history"); 
  };

  return (
    <>
      <button onClick={() => setCartOpen(true)} className="fixed bottom-8 right-8 z-[9990] bg-[#CF7486] text-white p-5 rounded-full shadow-[0_8px_0_#a65d6c] hover:scale-110 active:translate-y-1 active:shadow-none transition-all">
        <ShoppingBag size={28} />
        {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-[#8b5a2b] text-white text-[10px] font-black h-6 w-6 flex items-center justify-center rounded-full border-2 border-white">{cart.reduce((a, b) => a + b.qty, 0)}</span>}
      </button>

      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCartOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="fixed top-0 right-0 h-full w-full max-w-[400px] bg-[#fffdf5] z-[9999] flex flex-col border-l-[3px] border-[#8b5a2b]">
              
              <div className="p-6 border-b-[3px] border-[#8b5a2b] flex justify-between items-center bg-[#FFE6ED]">
                <div className="flex items-center gap-2 text-[#1a120b]">
                  <ShoppingBag size={24} />
                  <h2 className="text-xl font-black uppercase italic tracking-tight">Your Bag</h2>
                </div>
                <div className="flex items-center gap-4">
                  {cart.length > 0 && (
                    <button onClick={clearCart} className="text-[#CF7486] hover:text-[#a65d6c] transition-colors" title="Clear All">
                      <Trash2 size={20} strokeWidth={2.5} />
                    </button>
                  )}
                  <button onClick={() => setCartOpen(false)} className="text-[#1a120b] hover:rotate-90 transition-all">
                      <X size={26} strokeWidth={3} />
                  </button>
                </div>
              </div>

              <div className="flex-grow overflow-y-auto p-6 space-y-6">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                     <ShoppingBag size={48} className="text-[#8b5a2b]/20" />
                     <div className="text-[#1a120b]/40 font-black uppercase text-xs">Bag is empty</div>
                  </div>
                ) : (
                  cart.map((item) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={item._id} 
                      className="relative flex gap-4 bg-white p-3 rounded-2xl border-2 border-[#8b5a2b] shadow-[4px_4px_0_#8b5a2b]"
                    >
                      <button 
                        onClick={() => removeItem(item._id)}
                        className="absolute -top-2 -left-2 bg-[#CF7486] text-white p-1 rounded-full border-2 border-[#8b5a2b] shadow-[2px_2px_0_#8b5a2b] hover:scale-110 active:translate-y-0.5 active:shadow-none transition-all z-20"
                        title="Remove Item"
                      >
                        <X size={12} strokeWidth={4} />
                      </button>

                      <div className="relative h-16 w-16 shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover rounded-xl border border-[#8b5a2b]/10" unoptimized />
                      </div>
                      
                      <div className="flex flex-col justify-between flex-grow">
                        <h3 className="font-black text-[#1a120b] text-[11px] uppercase leading-tight pr-2">{item.name}</h3>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center bg-[#fdfcf0] border border-[#8b5a2b]/20 rounded-lg overflow-hidden">
                            <button 
                              onClick={() => item.qty > 1 && updateQty(item._id, item.qty - 1)} 
                              disabled={item.qty <= 1}
                              className={`p-1.5 text-[#1a120b] ${item.qty <= 1 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-[#8b5a2b]/10'}`}
                            >
                              <Minus size={12} />
                            </button>
                            
                            <input 
                              type="number"
                              value={item.qty === 0 ? "" : item.qty}
                              onFocus={() => { if (item.qty === 1) updateQty(item._id, 0); }}
                              onBlur={() => { if (item.qty === 0 || isNaN(item.qty)) updateQty(item._id, 1); }}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                updateQty(item._id, isNaN(val) ? 0 : val);
                              }}
                              className="w-10 text-center font-black text-xs text-[#1a120b] bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />

                            <button onClick={() => updateQty(item._id, item.qty + 1)} className="p-1.5 text-[#1a120b] hover:bg-[#8b5a2b]/10">
                              <Plus size={12} />
                            </button>
                          </div>
                          <p className="font-bold text-[#8b5a2b] text-sm">৳ {(item.price * item.qty).toLocaleString()}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 bg-white border-t-[3px] border-[#8b5a2b] space-y-4 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#1a120b] uppercase ml-1">Recipient Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a321a]" size={16} />
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-[#fdfcf0] border-2 border-[#8b5a2b] rounded-xl text-xs font-bold focus:outline-none text-[#1a120b]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#1a120b] uppercase ml-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a321a]" size={16} />
                      <input
                        type="tel"
                        placeholder="017XXXXXXXX"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 bg-[#fdfcf0] border-2 rounded-xl text-xs font-bold focus:outline-none text-[#1a120b] ${phoneNumber && !bdPhoneRegex.test(phoneNumber) ? 'border-red-400' : 'border-[#8b5a2b]'}`}
                      />
                    </div>
                  </div>

                  <LocationSearch onSelect={(addr, lat, lon) => { setAddress(addr); setCoords([lat, lon]); }} />

                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-[#1a120b]/60 uppercase tracking-widest">Total + ৳50 Delivery</span>
                      <span className="text-2xl font-black text-[#8b5a2b]">৳ {(total + 50).toLocaleString()}</span>
                    </div>
                  </div>
                  <button 
                    onClick={handleCheckout} 
                    disabled={!isFormValid} 
                    className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all ${isFormValid ? "bg-[#90be6d] text-white shadow-[0_4px_0_#5a7d32] active:translate-y-1 active:shadow-none" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                  >
                    Confirm Order
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}