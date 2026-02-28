"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Trash2, Minus, Plus, X, CreditCard, CheckCircle, MapPin, Clock, ReceiptText, Loader2, ShieldAlert, Undo2, Globe2 } from "lucide-react";
import OrderTracker from "./OrderTracker"; 

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
}

export default function Cart({
  cart,
  cartOpen,
  setCartOpen,
  setCart,
  removeFromCart,
  total,
}: CartProps) {
  const [isOrdered, setIsOrdered] = useState(false);
  const [orderId] = useState(() => `ST4R-${Math.floor(1000 + Math.random() * 9000)}`);
  
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [deliveryProgress, setDeliveryProgress] = useState(0);

  // --- CANCELLATION LOGIC (2 Minutes) ---
  const [cancelTimer, setCancelTimer] = useState(120); 
  const [canCancel, setCanCancel] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOrdered && cancelTimer > 0) {
      interval = setInterval(() => {
        setCancelTimer((prev) => prev - 1);
      }, 1000);
    } else if (cancelTimer === 0) {
      setCanCancel(false);
    }
    return () => clearInterval(interval);
  }, [isOrdered, cancelTimer]);

  const handleCancelOrder = () => {
    if (deliveryProgress > 90) {
        alert("The rider is almost at your door! Cancellation is no longer possible. 🛵");
        return;
    }
    const confirmCancel = window.confirm("Are you sure you want to cancel? This will clear your cart. 🍩");
    if (confirmCancel) {
      setIsOrdered(false);
      setCart([]);
      setAddress("");
      setCoords(null);
      setCancelTimer(120);
      setCanCancel(true);
      setDeliveryProgress(0);
    }
  };

  const deliveryTime = useMemo(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 35);
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [isOrdered]);

  const updateQty = (id: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item._id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const handleCheckout = async () => {
    if (!address || address.length < 5) {
      alert("Please enter a valid address in Bangladesh! 📍");
      return;
    }

    setIsGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=bd&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);

        if (lat < 20.0 || lat > 27.0 || lon < 88.0 || lon > 93.0) {
            throw new Error("Out of bounds");
        }

        setCoords([lat, lon]);
        setIsOrdered(true);
      } else {
        alert("We couldn't find that location in Bangladesh. Please be more specific.");
      }
    } catch (error) {
      setCoords([23.7500, 90.3880]);
      setIsOrdered(true);
    } finally {
      setIsGeocoding(false);
    }
  };

  const closeCart = () => {
    setCartOpen(false);
    if (isOrdered && (!canCancel || deliveryProgress >= 100)) {
        setTimeout(() => {
            setIsOrdered(false);
            setCart([]);
            setAddress(""); 
            setCoords(null);
            setCancelTimer(120);
            setCanCancel(true);
            setDeliveryProgress(0);
        }, 500);
    }
  };

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-[400px] bg-[#fffdf5] shadow-[-10px_0_30px_rgba(0,0,0,0.05)] z-[9999] flex flex-col border-l-[3px] border-[#8b5a2b]"
          >
            {/* HEADER */}
            <div className={`p-6 border-b-[3px] border-[#8b5a2b] flex justify-between items-center transition-colors ${isOrdered ? 'bg-[#90be6d]' : 'bg-[#FFE6ED]'}`}>
              <div className="flex items-center gap-2 text-white">
                {isOrdered ? <CheckCircle size={24} /> : <ShoppingBag className="text-[#CF7486]" size={24} />}
                <h2 className={`text-xl font-black uppercase tracking-tight ${isOrdered ? 'text-white' : 'text-[#CF7486]'}`}>
                    {isOrdered ? "Order Confirmed" : "Your Orders"}
                </h2>
              </div>
              <button onClick={closeCart} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X size={24} className={isOrdered ? 'text-white' : 'text-[#CF7486]'} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              <AnimatePresence mode="wait">
                {!isOrdered ? (
                  <motion.div key="cart-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                    {/* 🌍 BANGLADESH ONLY NOTE */}
                    <div className="bg-[#f0f9eb] border-2 border-[#90be6d]/30 p-3 rounded-2xl flex items-center gap-3">
                        <Globe2 size={18} className="text-[#90be6d] shrink-0" />
                        <p className="text-[10px] font-black text-[#5a7d32] uppercase leading-tight">
                            Note: We only deliver within <span className="underline">Bangladesh</span>.
                        </p>
                    </div>

                    {cart.length === 0 ? (
                      <div className="h-64 flex flex-col items-center justify-center text-center space-y-4 opacity-60">
                        <div className="text-6xl">🍰</div>
                        <p className="font-bold text-[#8b5a2b]">Your cart is looking a bit lonely...</p>
                      </div>
                    ) : (
                      cart.map((item) => (
                        <motion.div layout key={item._id} className="group relative flex gap-4 bg-white p-3 rounded-2xl border-2 border-[#8b5a2b] shadow-[4px_4px_0px_#8b5a2b]">
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
                  <motion.div key="receipt" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-10">
                    <OrderTracker 
                        address={address} 
                        destination={coords || [23.7639, 90.3886]} 
                        onProgressUpdate={setDeliveryProgress} 
                    />

                    {/* 📍 DELIVERY INFO */}
                    <div className="bg-white border-2 border-[#8b5a2b] rounded-2xl p-4 shadow-[4px_4px_0px_#8b5a2b] space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="bg-[#FFE6ED] p-2 rounded-lg"><MapPin size={20} className="text-[#CF7486]" /></div>
                            <div>
                                <p className="text-[10px] font-black text-[#8b5a2b]/50 uppercase">Deliver to</p>
                                <p className="text-xs font-black text-[#8b5a2b]">{address}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="bg-[#f0f9eb] p-2 rounded-lg"><Clock size={20} className="text-[#90be6d]" /></div>
                            <div>
                                <p className="text-[10px] font-black text-[#8b5a2b]/50 uppercase">Estimated Arrival</p>
                                <p className="text-xs font-black text-[#8b5a2b]">{deliveryTime} (35-40 mins)</p>
                            </div>
                        </div>
                    </div>

                    {/* 🧾 DIGITAL RECEIPT */}
                    <div className="bg-[#fff] border-2 border-[#8b5a2b] rounded-xl relative overflow-hidden">
                        <div className="bg-[#8b5a2b] text-white p-2 flex items-center justify-center gap-2">
                            <ReceiptText size={14} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Official Receipt</span>
                        </div>
                        <div className="p-4 space-y-3">
                            <div className="text-center pb-3 border-b-2 border-dashed border-[#8b5a2b]/20">
                                <p className="font-black text-[#8b5a2b] text-sm uppercase">Honey Haze Receipt 🍯</p>
                                <p className="text-[10px] font-bold text-[#8b5a2b]/50">{orderId}</p>
                            </div>

                            <div className="space-y-2 py-2">
                                {cart.map(item => (
                                    <div key={item._id} className="flex justify-between text-xs font-bold text-[#8b5a2b]">
                                        <span>{item.qty}x {item.name}</span>
                                        <span>৳ {(item.price * item.qty).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-3 border-t-2 border-dashed border-[#8b5a2b]/20 space-y-1">
                                <div className="flex justify-between text-[10px] font-bold text-[#8b5a2b]/60 uppercase">
                                    <span>Subtotal</span>
                                    <span>৳ {total.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-[10px] font-bold text-[#8b5a2b]/60 uppercase">
                                    <span>Delivery Fee</span>
                                    <span>৳ 50</span>
                                </div>
                                <div className="flex justify-between pt-2">
                                    <span className="font-black text-[#8b5a2b] uppercase text-sm">Pay on delivery</span>
                                    <span className="font-black text-[#D4A24C] text-sm">৳ {(total + 50).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CANCEL BUTTON SECTION */}
                    <div className="space-y-3">
                        {canCancel && deliveryProgress < 90 ? (
                            <button 
                                onClick={handleCancelOrder}
                                className="w-full bg-white border-2 border-[#CF7486] text-[#CF7486] py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-[#FFE6ED] transition-colors flex items-center justify-center gap-2"
                            >
                                <Undo2 size={14} />
                                Cancel Order ({Math.floor(cancelTimer / 60)}:{(cancelTimer % 60).toString().padStart(2, '0')})
                            </button>
                        ) : (
                            <div className="p-3 bg-[#fdfcf0] border-2 border-dashed border-[#8b5a2b]/20 rounded-2xl text-center">
                                <p className="text-[9px] font-black text-[#8b5a2b]/40 uppercase">
                                    {deliveryProgress >= 100 ? "Order Delivered!" : "Order is being prepared. Cancellation locked."}
                                </p>
                            </div>
                        )}

                        <button 
                            onClick={closeCart}
                            className="w-full bg-[#8b5a2b] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-[0_4px_0_#5d3d1e] active:translate-y-[2px] transition-all"
                        >
                            Back to Menu 🍩
                        </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {cart.length > 0 && !isOrdered && (
              <div className="p-6 bg-white border-t-[3px] border-[#8b5a2b] space-y-4">
                 <div className="bg-[#fdfcf0] border-2 border-[#8b5a2b]/10 p-3 rounded-xl flex gap-3">
                  <div className="text-[#CF7486] flex-shrink-0 pt-0.5">
                    <ShieldAlert size={16} />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-[10px] font-black text-[#8b5a2b] uppercase">Cancellation Policy</h4>
                    <p className="text-[9px] font-bold text-[#8b5a2b]/60 leading-tight">
                      Free cancellation within 2 mins. After dispatch, full payment is required for Cash on Delivery.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#8b5a2b] uppercase ml-1">Delivery Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-[#CF7486]" size={16} />
                    <input 
                      type="text"
                      placeholder="e.g. Road 27, Dhanmondi"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[#fdfcf0] border-2 border-[#8b5a2b] rounded-xl text-xs font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <span className="text-[10px] font-black text-[#8b5a2b]/40 uppercase block leading-none">Pay on delivery</span>
                        <span className="text-2xl font-black text-[#D4A24C] leading-none">৳ {(total + 50).toLocaleString()}</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#8b5a2b]/60 text-right">Inc. ৳50 delivery fee</span>
                </div>

                <button 
                    onClick={handleCheckout}
                    disabled={isGeocoding}
                    className="w-full bg-[#90be6d] hover:bg-[#7eab5d] text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-[0_4px_0_#5a7d32] active:translate-y-[2px] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                >
                  {isGeocoding ? <Loader2 size={20} className="animate-spin" /> : <CreditCard size={20} />}
                  {isGeocoding ? "Pinning Location..." : "Confirm Order"}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}