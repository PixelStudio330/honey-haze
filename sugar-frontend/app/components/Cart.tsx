"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, Trash2, Minus, Plus, X, CreditCard, 
  CheckCircle, MapPin, Clock, Loader2, 
  Globe2, Search, User, Phone, MessageSquare, Send, RefreshCcw 
} from "lucide-react";
import dynamic from "next/dynamic";

// Dynamic import with SSR disabled
const OrderTracker = dynamic(() => import("./OrderTracker"), { 
  ssr: false,
  loading: () => (
    <div className="h-48 w-full bg-[#fdfcf0] animate-pulse rounded-2xl flex flex-col items-center justify-center border-2 border-[#8b5a2b] border-dashed">
      <Loader2 className="animate-spin text-[#8b5a2b] mb-2" size={20} />
      <span className="text-[10px] font-bold text-[#8b5a2b] uppercase">Initializing GPS...</span>
    </div>
  )
}); 

export interface CartItem {
  _id: string;
  foodId: string;
  name: string;
  price: number;
  qty: number;
  image: string;
}

interface CartProps {
  cart: CartItem[];
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  setCart: (cart: CartItem[] | ((prev: CartItem[]) => CartItem[])) => void;
  removeFromCart: (id: string) => void;
  total: number;
  isOrdered: boolean;
  setIsOrdered: (val: boolean) => void;
}

// --- SUB-COMPONENT: AESTHETIC ORDER MEMO ---
function MemoReceipt({ items, total, orderId }: { items: CartItem[], total: number, orderId: string }) {
  const deliveryFee = 50;
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full bg-white border-x-2 border-t-2 border-[#8b5a2b] pt-8 px-6 pb-10 shadow-[6px_6px_0px_rgba(139,90,43,0.08)] overflow-hidden"
    >
      <div className="absolute left-2 top-0 bottom-0 flex flex-col justify-around py-6 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-2.5 h-2.5 rounded-full bg-[#fffdf5] border-2 border-[#8b5a2b]" />
        ))}
      </div>

      <div className="text-center mb-6">
        <h3 className="font-black text-[#8b5a2b] text-sm uppercase tracking-[0.2em]">Honey Haze</h3>
        <p className="text-[9px] font-bold text-[#8b5a2b]/40 uppercase tracking-widest">Order Summary Memo</p>
        <div className="mt-2 flex justify-center gap-1 opacity-20">
          {[...Array(15)].map((_, i) => <span key={i} className="text-[8px] font-black text-[#8b5a2b]">*</span>)}
        </div>
      </div>

      <div className="flex justify-between text-[9px] font-mono font-bold text-[#8b5a2b]/60 mb-6 border-b border-dashed border-[#8b5a2b]/20 pb-2">
        <span>REF: {orderId}</span>
        <span>{new Date().toLocaleDateString()}</span>
      </div>

      <div className="space-y-4 mb-6">
        {items.map((item, idx) => (
          <div key={idx} className="flex justify-between items-start text-[#8b5a2b]">
            <div className="flex flex-col max-w-[70%]">
              <span className="font-black text-[10px] uppercase leading-tight">{item.name}</span>
              <span className="font-mono text-[9px] opacity-60">QTY: {item.qty} x ৳{item.price}</span>
            </div>
            <span className="font-mono font-black text-xs">৳{(item.qty * item.price).toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div className="space-y-1.5 border-t-2 border-dashed border-[#8b5a2b]/10 pt-4">
        <div className="flex justify-between text-[9px] font-bold text-[#8b5a2b]/50 uppercase">
          <span>Subtotal</span>
          <span>৳{total.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-[9px] font-bold text-[#8b5a2b]/50 uppercase">
          <span>Delivery (COD)</span>
          <span>৳{deliveryFee}</span>
        </div>
        <div className="flex justify-between items-center pt-2">
          <span className="font-black text-xs text-[#8b5a2b] uppercase tracking-tighter">Amount Payable</span>
          <span className="text-lg font-black text-[#D4A24C]">৳{(total + deliveryFee).toLocaleString()}</span>
        </div>
      </div>

      <div className="absolute bottom-0 left-[-2px] right-[-2px] translate-y-[1px]">
        <svg viewBox="0 0 100 10" preserveAspectRatio="none" className="w-full h-4 fill-[#fffdf5] stroke-[#8b5a2b] stroke-[0.5]">
          <path d="M0 0 L5 8 L10 0 L15 8 L20 0 L25 8 L30 0 L35 8 L40 0 L45 8 L50 0 L55 8 L60 0 L65 8 L70 0 L75 8 L80 0 L85 8 L90 0 L95 8 L100 0 V10 H0 Z" />
        </svg>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 pointer-events-none opacity-10">
         <div className="border-4 border-[#8b5a2b] p-2 rounded-xl">
            <span className="text-4xl font-black text-[#8b5a2b] uppercase">PAID COD</span>
         </div>
      </div>
    </motion.div>
  );
}

// --- SUB-COMPONENT: AI RIDER CHAT ---
function RiderChat({ progress, total }: { progress: number; total: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{role: 'rider' | 'user', text: string}[]>([
    { role: 'rider', text: "Hey! I've picked up your treats. On my way! 🛵" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const res = await fetch("/api/rider-chat", {
        method: "POST",
        body: JSON.stringify({ 
          message: userMsg, 
          riderName: "Sagor", 
          progress: Math.floor(progress),
          total: total + 50 
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'rider', text: data.text }]);
    } catch {
      setMessages(prev => [...prev, { role: 'rider', text: "Signal is weak in this alley! 🛵" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-white border-2 border-[#8b5a2b] rounded-2xl shadow-[4px_4px_0px_#8b5a2b] overflow-hidden">
      <div className="p-4 flex items-center justify-between border-b-2 border-[#8b5a2b]/10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-[#FFE6ED] rounded-full border-2 border-[#8b5a2b] flex items-center justify-center">
             <User className="text-[#8b5a2b]" size={20} />
          </div>
          <div>
            <h4 className="text-[10px] font-black text-[#8b5a2b] uppercase">Sagor (Rider)</h4>
            <p className={`text-[9px] font-bold flex items-center gap-1 ${progress >= 100 ? 'text-[#90be6d]' : 'text-orange-500'}`}>
              <span className={progress < 100 ? "animate-pulse" : ""}>●</span> 
              {progress < 100 ? 'On the way' : 'Arrived at location'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 bg-[#fdfcf0] border-2 border-[#8b5a2b] rounded-xl text-[#8b5a2b] hover:bg-[#FFE6ED]">
            <Phone size={14} />
          </button>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 border-2 border-[#8b5a2b] rounded-xl transition-all ${isOpen ? 'bg-[#8b5a2b] text-white' : 'bg-[#fdfcf0] text-[#8b5a2b]'}`}
          >
            <MessageSquare size={14} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0 }} animate={{ height: 250 }} exit={{ height: 0 }} className="flex flex-col bg-[#fdfcf0]">
            <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-2 rounded-xl text-[10px] font-bold ${
                    m.role === 'user' ? 'bg-[#8b5a2b] text-white rounded-tr-none' : 'bg-white border border-[#8b5a2b]/20 text-[#8b5a2b] rounded-tl-none'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start animate-pulse">
                  <div className="bg-white p-2 rounded-xl border border-[#8b5a2b]/20">
                    <Loader2 size={12} className="animate-spin text-[#8b5a2b]" />
                  </div>
                </div>
              )}
            </div>
            <div className="p-3 border-t-2 border-[#8b5a2b]/10 flex gap-2">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Message Sagor..."
                className="flex-grow bg-white border-2 border-[#8b5a2b] rounded-lg px-3 py-1 text-[10px] font-bold focus:outline-none"
              />
              <button onClick={handleSend} className="p-2 bg-[#90be6d] text-white rounded-lg border-2 border-[#8b5a2b]">
                <Send size={12} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- SUB-COMPONENT: BD-ONLY SEARCH ---
function LocationSearch({ onSelect, viewbox }: { onSelect: (addr: string, lat: number, lon: number) => void, viewbox: string }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length < 3) {
        setSuggestions([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=bd&viewbox=${viewbox}&bounded=1&limit=15&addressdetails=1`
        );
        const data = await res.json();
        setSuggestions(data);
        setShowDropdown(true);
      } catch (err) {
        console.error("Geocoding failed", err);
      } finally {
        setLoading(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [query, viewbox]);

  return (
    <div className="relative space-y-2">
      <label className="text-[10px] font-black text-[#8b5a2b] uppercase ml-1">Delivery Address</label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-[#CF7486]" size={16} />
        <input
          type="text"
          placeholder="Type your area (e.g. Dhanmondi)..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); if(e.target.value === "") onSelect("", 0, 0); }}
          className="w-full pl-10 pr-4 py-3 bg-[#fdfcf0] border-2 border-[#8b5a2b] rounded-xl text-xs font-bold focus:outline-none"
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[#8b5a2b]/40" size={14} />}
      </div>

      <AnimatePresence>
        {showDropdown && query.length >= 3 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0 }}
            className="absolute z-[10001] w-full bg-white border-2 border-[#8b5a2b] rounded-2xl shadow-[8px_8px_0px_rgba(139,90,43,0.1)] mt-1 overflow-y-auto max-h-[200px] custom-scrollbar"
          >
            {suggestions.length > 0 ? suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  onSelect(s.display_name, parseFloat(s.lat), parseFloat(s.lon));
                  setQuery(s.display_name);
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-3 text-[10px] font-bold text-[#8b5a2b] hover:bg-[#f0f9eb] border-b border-[#8b5a2b]/10 last:border-0 flex items-start gap-2 transition-colors"
              >
                <Search size={12} className="shrink-0 text-[#90be6d] mt-0.5" />
                <span className="leading-tight">{s.display_name}</span>
              </button>
            )) : (
              <div className="p-4 text-center text-[10px] font-black text-[#CF7486] uppercase">No locations in BD 🚨</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #fdfcf0;
          border-radius: 0 14px 14px 0;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #8b5a2b;
          border-radius: 10px;
          border: 2px solid #fdfcf0;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #D4A24C;
        }
      `}</style>
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function Cart({ cart, cartOpen, setCartOpen, setCart, total, isOrdered, setIsOrdered }: CartProps) {
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [deliveryProgress, setDeliveryProgress] = useState(0);
  const [cancelTimer, setCancelTimer] = useState(120); 
  const [canCancel, setCanCancel] = useState(true);
  const [orderStartTime, setOrderStartTime] = useState<number | null>(null);

  const BD_BOUNDS = { viewbox: "88.01,20.34,92.67,26.63" };

  // --- PERSISTENCE: LOAD ORDER ---
  useEffect(() => {
    const savedOrder = localStorage.getItem("honey_haze_order");
    if (savedOrder) {
      const data = JSON.parse(savedOrder);
      setAddress(data.address);
      setCoords(data.coords);
      setIsOrdered(data.isOrdered);
      setOrderStartTime(data.startTime);
      
      if (data.startTime && data.isOrdered) {
        const elapsedSeconds = (Date.now() - data.startTime) / 1000;
        // Progress rate in sync with Tracker (0.2% every 100ms = 2% per second)
        const calculatedProgress = Math.min(elapsedSeconds * 2.0, 100);
        setDeliveryProgress(calculatedProgress);
      }
    }
  }, [setIsOrdered]);

  // --- PERSISTENCE: SAVE ORDER ---
  useEffect(() => {
    if (isOrdered) {
      const orderData = {
        address,
        coords,
        isOrdered,
        startTime: orderStartTime || Date.now(),
      };
      localStorage.setItem("honey_haze_order", JSON.stringify(orderData));
      if (!orderStartTime) setOrderStartTime(orderData.startTime);
    }
  }, [isOrdered, address, coords, orderStartTime]);

  const handleProgressUpdate = useCallback((p: number) => {
    setDeliveryProgress(p);
  }, []);

  useEffect(() => {
    let interval: any;
    if (isOrdered && cancelTimer > 0) {
      interval = setInterval(() => setCancelTimer((prev) => prev - 1), 1000);
    } else if (cancelTimer === 0) {
      setCanCancel(false);
    }
    return () => clearInterval(interval);
  }, [isOrdered, cancelTimer]);

  const updateQty = (id: string, delta: number) => {
    if (isOrdered) return;
    setCart((prev) => prev.map((item) => {
      if (item._id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter((item): item is CartItem => item !== null));
  };

  const handleCheckout = () => {
    if (!coords || !address) {
      alert("Please select a valid Bangladesh address! 🇧🇩");
      return;
    }
    setOrderStartTime(Date.now());
    setIsOrdered(true);
  };

  const handleResetEverything = () => {
    setIsOrdered(false);
    setCart([]);
    setAddress("");
    setCoords(null);
    setCancelTimer(120);
    setDeliveryProgress(0);
    setOrderStartTime(null);
    localStorage.removeItem("honey_haze_order");
    setCartOpen(false); // Close sidebar after reset
  };

  const handleCancelOrder = () => {
    if (window.confirm("Cancel order and clear cart? 🍩")) {
      handleResetEverything();
    }
  };

  const deliveryTime = useMemo(() => {
    const timeToUse = orderStartTime || Date.now();
    const arrivalTime = new Date(timeToUse);
    arrivalTime.setMinutes(arrivalTime.getMinutes() + 35);
    return arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [isOrdered, orderStartTime]);

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCartOpen(false)} className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]" />

          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-[400px] bg-[#fffdf5] shadow-[-10px_0_30px_rgba(0,0,0,0.05)] z-[9999] flex flex-col border-l-[3px] border-[#8b5a2b]"
          >
            {/* HEADER */}
            <div className={`p-6 border-b-[3px] border-[#8b5a2b] flex justify-between items-center transition-colors duration-500 ${isOrdered ? 'bg-[#90be6d]' : 'bg-[#FFE6ED]'}`}>
              <div className="flex items-center gap-2 text-white">
                {isOrdered ? <CheckCircle size={24} /> : <ShoppingBag className="text-[#CF7486]" size={24} />}
                <h2 className="text-xl font-black uppercase tracking-tight">
                    {isOrdered ? (deliveryProgress >= 100 ? "Delivered!" : "Tracking Order") : "Your Bag"}
                </h2>
              </div>
              <button onClick={() => setCartOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X size={24} className="text-white" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              <AnimatePresence mode="wait">
                {!isOrdered ? (
                  <motion.div key="cart-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                    <div className="bg-[#f0f9eb] border-2 border-[#90be6d]/30 p-3 rounded-2xl flex items-center gap-3">
                        <Globe2 size={18} className="text-[#90be6d] shrink-0" />
                        <p className="text-[10px] font-black text-[#5a7d32] uppercase leading-tight">
                            Delivering only in <span className="underline">Bangladesh</span>.
                        </p>
                    </div>

                    {cart.length === 0 ? (
                      <div className="h-64 flex flex-col items-center justify-center text-center space-y-4 opacity-60">
                        <div className="text-6xl">🍰</div>
                        <p className="font-bold text-[#8b5a2b]">Your bag is empty...</p>
                      </div>
                    ) : (
                      cart.map((item) => (
                        <motion.div layout key={item._id} className="group relative flex gap-4 bg-white p-3 rounded-2xl border-2 border-[#8b5a2b] shadow-[4px_4px_0_#8b5a2b]">
                          <div className="relative h-16 w-16 flex-shrink-0">
                            <Image src={item.image} alt={item.name} fill className="object-cover rounded-xl" unoptimized />
                          </div>
                          <div className="flex flex-col justify-between py-1 flex-grow">
                            <h3 className="font-black text-[#8b5a2b] text-xs uppercase">{item.name}</h3>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center bg-[#fdfcf0] border border-[#8b5a2b]/20 rounded-lg">
                                <button onClick={() => updateQty(item._id, -1)} className="p-1 text-[#8b5a2b]">{item.qty === 1 ? <Trash2 size={12} /> : <Minus size={12} />}</button>
                                <span className="w-6 text-center font-bold text-xs">{item.qty}</span>
                                <button onClick={() => updateQty(item._id, 1)} className="p-1 text-[#8b5a2b]"><Plus size={12} /></button>
                              </div>
                              <span className="font-black text-[#8b5a2b] text-sm">৳ {(item.price * item.qty).toLocaleString()}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                ) : (
                  <motion.div key="tracking-view" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-10">
                    
                    {coords && coords[0] !== 0 && (
                      <OrderTracker 
                        address={address} 
                        destination={coords} 
                        onProgressUpdate={handleProgressUpdate} 
                        initialProgress={deliveryProgress} 
                      />
                    )}

                    <MemoReceipt 
                        items={cart} 
                        total={total} 
                        orderId={`HH-${Math.floor((orderStartTime || Date.now()) / 100000)}`} 
                    />

                    <RiderChat progress={deliveryProgress} total={total} />

                    <div className="bg-white border-2 border-[#8b5a2b] rounded-2xl p-4 shadow-[4px_4px_0px_#8b5a2b] space-y-3">
                        <div className="flex items-start gap-3 text-[11px] font-black text-[#8b5a2b]">
                            <MapPin size={16} className="text-[#CF7486] shrink-0 mt-0.5" />
                            <p className="leading-relaxed">{address}</p>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-black text-[#8b5a2b]">
                            <Clock size={16} className="text-[#90be6d] shrink-0" />
                            <p>{deliveryProgress >= 100 ? "Arrived!" : `ETA: ${deliveryTime}`}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {canCancel && deliveryProgress < 90 ? (
                            <button onClick={handleCancelOrder} className="w-full bg-white border-2 border-[#CF7486] text-[#CF7486] py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-[0_4px_0_#CF7486] active:translate-y-1 transition-all">
                                Cancel Order ({Math.floor(cancelTimer / 60)}:{(cancelTimer % 60).toString().padStart(2, '0')})
                            </button>
                        ) : null}

                        {deliveryProgress >= 100 ? (
                          <button 
                            onClick={handleResetEverything} 
                            className="w-full bg-[#90be6d] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-[0_4px_0_#5a7d32] active:translate-y-1 transition-all flex items-center justify-center gap-2"
                          >
                            <RefreshCcw size={16} />
                            Go back to menu
                          </button>
                        ) : (
                          <button 
                            onClick={() => setCartOpen(false)} 
                            className="w-full bg-[#8b5a2b] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-[0_4px_0_#5d3d1e] active:translate-y-1 transition-all"
                          >
                            Close Tracker
                          </button>
                        )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* CHECKOUT FOOTER */}
            {cart.length > 0 && !isOrdered && (
              <div className="p-6 bg-white border-t-[3px] border-[#8b5a2b] space-y-4">
                <LocationSearch 
                  viewbox={BD_BOUNDS.viewbox}
                  onSelect={(addr, lat, lon) => { 
                    setAddress(addr); 
                    setCoords([lat, lon]); 
                  }}
                />

                <div className="flex justify-between items-end pt-2">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-[#8b5a2b]/40 uppercase tracking-tighter">Total Bill (Cash on Delivery)</span>
                        <span className="text-2xl font-black text-[#D4A24C]">৳ {(total + 50).toLocaleString()}</span>
                    </div>
                </div>

                <button 
                    onClick={handleCheckout}
                    disabled={!coords || coords[0] === 0}
                    className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                      coords && coords[0] !== 0 
                        ? "bg-[#90be6d] text-white shadow-[0_4px_0_#5a7d32] active:translate-y-[2px]" 
                        : "bg-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                    }`}
                >
                  <CreditCard size={20} />
                  Confirm Order
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}