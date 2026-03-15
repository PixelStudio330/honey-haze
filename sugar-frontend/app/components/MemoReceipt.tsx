"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckCircle2, User, Phone, MapPin } from "lucide-react";

interface MemoItem {
  name: string;
  qty: number;
  price: number;
  image?: string;
}

interface MemoReceiptProps {
  items: MemoItem[];
  total: number;
  orderId?: string;
  date?: number;
  customerName?: string;
  phoneNumber?: string;
  address?: string;
}

export default function MemoReceipt({ 
  items = [], 
  total = 0, 
  orderId = "HH-7721", 
  date, 
  customerName = "Guest", 
  phoneNumber = "Not Provided",
  address = "Store Pickup"
}: MemoReceiptProps) {
  const deliveryFee = 50;
  const [isAccepted, setIsAccepted] = useState(false);
  
  const formattedTime = new Date(date || Date.now()).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAccepted(true);
    }, 12000); 

    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full bg-white border-x-[3px] border-t-[3px] border-[#8b5a2b] pt-8 px-6 pb-12 overflow-hidden shadow-sm"
    >
      {/* Side Hole Punches */}
      <div className="absolute left-2 top-0 bottom-0 flex flex-col justify-around py-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="w-2.5 h-2.5 rounded-full bg-[#fffdf5] border-2 border-[#8b5a2b]" />
        ))}
      </div>

      {/* Brand Header */}
      <div className="text-center mb-6 space-y-1">
        <h3 className="font-black text-[#8b5a2b] text-sm uppercase tracking-[0.3em]">Honey Haze</h3>
        <p className="text-[9px] font-bold text-[#8b5a2b]/40 uppercase tracking-widest">Order Summary Memo</p>
      </div>

      {/* Status Badge & Time */}
      <div className="flex flex-col items-center mb-6 gap-2">
        <div className="flex items-center gap-4 text-[9px] font-mono font-black uppercase">
          <div className="flex items-center gap-1 text-[#8b5a2b]/60">
            <Clock size={10} />
            <span>Placed At: {formattedTime}</span>
          </div>
          <AnimatePresence mode="wait">
            {!isAccepted ? (
              <motion.span 
                key="pending"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-2 py-0.5 bg-[#FFE6ED] text-[#8b5a2b] border border-[#8b5a2b] rounded-full animate-pulse"
              >
                Waiting for Shop...
              </motion.span>
            ) : (
              <motion.span 
                key="accepted"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="px-2 py-0.5 bg-[#90be6d] text-white border border-[#8b5a2b] rounded-full flex items-center gap-1"
              >
                <CheckCircle2 size={8} />
                Order Accepted
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Meta Info */}
      <div className="flex justify-between text-[10px] font-mono font-bold text-[#8b5a2b]/60 mb-4 border-b border-dashed border-[#8b5a2b]/20 pb-2 pl-4">
        <span>ID: {orderId}</span>
        <span>{date ? new Date(date).toLocaleDateString() : new Date().toLocaleDateString()}</span>
      </div>

      {/* Customer Info Section */}
      <div className="pl-4 mb-6 space-y-1.5 border-b border-dashed border-[#8b5a2b]/20 pb-4 text-[#8b5a2b]">
        <div className="flex items-center gap-2">
          <User size={10} className="opacity-50" />
          <span className="text-[10px] font-black uppercase">{customerName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone size={10} className="opacity-50" />
          <span className="text-[10px] font-mono font-bold">{phoneNumber}</span>
        </div>
        <div className="flex items-start gap-2">
          <MapPin size={10} className="opacity-50 mt-0.5" />
          <span className="text-[9px] font-bold leading-tight opacity-70">{address}</span>
        </div>
      </div>

      {/* Items Table */}
      <div className="space-y-4 mb-8 pl-4">
        {items.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center">
            <div className="flex items-center gap-3 max-w-[70%]">
              {item.image && (
                <div className="h-10 w-10 rounded-lg border-2 border-[#8b5a2b] bg-[#FFE6ED] overflow-hidden shrink-0">
                  <img src={item.image} alt="" className="h-full w-full object-cover" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-black text-[11px] text-[#8b5a2b] uppercase leading-tight">{item.name}</span>
                <span className="font-mono text-[9px] text-[#8b5a2b]/50">QTY: {item.qty} x ৳{item.price}</span>
              </div>
            </div>
            <span className="font-mono font-black text-xs text-[#8b5a2b]">৳{(item.qty * item.price).toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* Totals Section */}
      <div className="space-y-2 border-t-2 border-dashed border-[#8b5a2b]/10 pt-4 pl-4">
        <div className="flex justify-between text-[10px] font-bold text-[#8b5a2b]/50 uppercase">
          <span>Subtotal</span>
          <span>৳{total.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-[10px] font-bold text-[#8b5a2b]/50 uppercase">
          <span>Delivery (COD)</span>
          <span>৳{deliveryFee}</span>
        </div>
        <div className="flex justify-between items-center pt-2">
          <span className="font-black text-xs text-[#8b5a2b] uppercase tracking-tighter">Amount Due</span>
          <span className="text-xl font-black text-[#D4A24C]">৳{(total + deliveryFee).toLocaleString()}</span>
        </div>
      </div>

      {/* Torn Edge Effect (SVG) */}
      <div className="absolute bottom-0 left-[-2px] right-[-2px] z-20">
        <svg viewBox="0 0 100 10" preserveAspectRatio="none" className="w-full h-5 fill-[#fffdf5] stroke-[#8b5a2b] stroke-[1]">
          <path d="M0 0 L5 8 L10 0 L15 8 L20 0 L25 8 L30 0 L35 8 L40 0 L45 8 L50 0 L55 8 L60 0 L65 8 L70 0 L75 8 L80 0 L85 8 L90 0 L95 8 L100 0 V10 H0 Z" />
        </svg>
      </div>
    </motion.div>
  );
}