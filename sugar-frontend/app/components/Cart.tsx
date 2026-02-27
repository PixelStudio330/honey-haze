"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Trash2, Minus, Plus, X, CreditCard, CheckCircle } from "lucide-react";

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

  // 🌸 UPDATED LOGIC: Auto-remove if qty drops below 1
  const updateQty = (id: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item._id === id) {
            const newQty = item.qty + delta;
            // If new quantity is 0 or less, we'll mark it for removal (returning null)
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null); // Remove the null items
    });
  };

  const handleCheckout = () => {
    setIsOrdered(true);
    setTimeout(() => {
      setCart([]);
    }, 500);
  };

  const closeCart = () => {
    setCartOpen(false);
    setTimeout(() => setIsOrdered(false), 500);
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
            <div className="p-6 border-b-[3px] border-[#8b5a2b] bg-[#FFE6ED] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShoppingBag className="text-[#CF7486]" size={24} />
                <h2 className="text-xl font-black text-[#CF7486] uppercase tracking-tight">
                    {isOrdered ? "Order Placed!" : "Your Orders"}
                </h2>
              </div>
              <button 
                onClick={closeCart}
                className="p-2 hover:bg-white/50 rounded-full transition-colors text-[#CF7486]"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 relative">
              <AnimatePresence mode="wait">
                {!isOrdered ? (
                  <motion.div 
                    key="cart-list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    {cart.length === 0 ? (
                      <div className="h-64 flex flex-col items-center justify-center text-center space-y-4 opacity-60">
                        <div className="text-6xl">🍰</div>
                        <p className="font-bold text-[#8b5a2b]">Your cart is looking a bit lonely...</p>
                      </div>
                    ) : (
                      cart.map((item) => (
                        <motion.div
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.8 }} // Added exit animation for items
                          key={item._id}
                          className="group relative flex gap-4 bg-white p-3 rounded-2xl border-2 border-[#8b5a2b] shadow-[4px_4px_0px_#8b5a2b] transition-all"
                        >
                          <div className="relative h-20 w-20 flex-shrink-0">
                            <Image src={item.image} alt={item.name} fill className="object-cover rounded-xl" />
                          </div>
                          <div className="flex flex-col justify-between py-1 flex-grow">
                            <div>
                              <h3 className="font-black text-[#8b5a2b] text-sm leading-tight uppercase">{item.name}</h3>
                              <p className="text-[#D4A24C] font-bold text-xs mt-1">৳ {item.price.toLocaleString()}</p>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center bg-[#fdfcf0] border border-[#8b5a2b]/20 rounded-lg px-1">
                                <button onClick={() => updateQty(item._id, -1)} className="p-1 text-[#8b5a2b] hover:text-[#CF7486]">
                                  {item.qty === 1 ? <Trash2 size={14} /> : <Minus size={14} />} 
                                </button>
                                <span className="w-8 text-center font-bold text-xs">{item.qty}</span>
                                <button onClick={() => updateQty(item._id, 1)} className="p-1 text-[#8b5a2b] hover:text-[#CF7486]"><Plus size={14} /></button>
                              </div>
                              <span className="font-black text-[#8b5a2b] text-sm">৳ {(item.price * item.qty).toLocaleString()}</span>
                            </div>
                          </div>
                          <button onClick={() => removeFromCart(item._id)} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full border-2 border-[#8b5a2b] opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} strokeWidth={3} /></button>
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                ) : (
                  <motion.div 
                    key="success-screen"
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="h-full flex flex-col items-center justify-center text-center space-y-6"
                  >
                    <motion.div
                        initial={{ rotate: -10, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                        className="bg-[#90be6d] p-6 rounded-full text-white shadow-lg"
                    >
                        <CheckCircle size={60} />
                    </motion.div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-[#8b5a2b] uppercase">Order Confirmed!</h2>
                        <p className="text-[#8b5a2b]/70 font-bold">Your treats are being prepared with love.</p>
                        <div className="bg-[#FFE6ED] border-2 border-dashed border-[#CF7486] p-3 rounded-xl mt-4">
                            <p className="text-[#CF7486] font-black text-sm uppercase tracking-widest">Order ID: #CC-{Math.floor(1000 + Math.random() * 9000)}</p>
                        </div>
                    </div>
                    <button 
                        onClick={closeCart}
                        className="bg-[#CF7486] text-white px-8 py-3 rounded-full font-black uppercase text-sm shadow-[0_4px_0_#a85a6a] hover:translate-y-[-2px] active:translate-y-[2px] active:shadow-none transition-all"
                    >
                        Keep Browsing 🍩
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {cart.length > 0 && !isOrdered && (
              <div className="p-6 bg-white border-t-[3px] border-[#8b5a2b] space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-[#8b5a2b]/60 uppercase">
                    <span>Subtotal</span>
                    <span>৳ {total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-end pt-2">
                    <span className="font-black text-[#8b5a2b] uppercase">Total</span>
                    <span className="text-2xl font-black text-[#D4A24C]">৳ {(total + 50).toLocaleString()}</span>
                  </div>
                </div>
                <button 
                    onClick={handleCheckout}
                    className="w-full bg-[#90be6d] hover:bg-[#7eab5d] text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-[0_4px_0_#5a7d32] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-3"
                >
                  <CreditCard size={20} />
                  Checkout Now
                </button>
                <button onClick={() => setCart([])} className="w-full flex items-center justify-center gap-2 text-[10px] font-bold text-[#CF7486] uppercase"><Trash2 size={12} /> Clear Entire Cart</button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}