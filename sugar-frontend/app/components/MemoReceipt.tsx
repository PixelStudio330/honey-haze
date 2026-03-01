"use client";
import { motion } from "framer-motion";

interface MemoItem {
  name: string;
  qty: number;
  price: number;
}

interface MemoReceiptProps {
  items: MemoItem[];
  total: number;
  orderId?: string;
}

export default function MemoReceipt({ items, total, orderId = "HH-7721" }: MemoReceiptProps) {
  const deliveryFee = 50;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full bg-white border-x-2 border-t-2 border-[#8b5a2b] pt-8 px-6 pb-12 shadow-[6px_6px_0px_rgba(139,90,43,0.15)] overflow-hidden"
    >
      {/* Side Hole Punches */}
      <div className="absolute left-2 top-0 bottom-0 flex flex-col justify-around py-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-2.5 h-2.5 rounded-full bg-[#fffdf5] border-2 border-[#8b5a2b]" />
        ))}
      </div>

      {/* Brand Header */}
      <div className="text-center mb-6 space-y-1">
        <h3 className="font-black text-[#8b5a2b] text-sm uppercase tracking-[0.3em]">Honey Haze</h3>
        <p className="text-[9px] font-bold text-[#8b5a2b]/40 uppercase tracking-widest">Order Summary Memo</p>
        <div className="flex justify-center gap-1 py-1">
          {[...Array(12)].map((_, i) => (
            <span key={i} className="text-[#8b5a2b]/20 text-[8px] font-black">*</span>
          ))}
        </div>
      </div>

      {/* Meta Info */}
      <div className="flex justify-between text-[10px] font-mono font-bold text-[#8b5a2b]/60 mb-6 border-b border-dashed border-[#8b5a2b]/20 pb-2">
        <span>NO: {orderId}</span>
        <span>{new Date().toLocaleDateString()}</span>
      </div>

      {/* Items Table */}
      <div className="space-y-4 mb-8">
        {items.map((item, idx) => (
          <div key={idx} className="flex justify-between items-start">
            <div className="flex flex-col max-w-[70%]">
              <span className="font-black text-[11px] text-[#8b5a2b] uppercase leading-tight">{item.name}</span>
              <span className="font-mono text-[9px] text-[#8b5a2b]/50">QTY: {item.qty} x ৳{item.price}</span>
            </div>
            <span className="font-mono font-black text-xs text-[#8b5a2b]">৳{(item.qty * item.price).toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* Totals Section */}
      <div className="space-y-2 border-t-2 border-dashed border-[#8b5a2b]/10 pt-4">
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
      <div className="absolute bottom-0 left-[-2px] right-[-2px]">
        <svg viewBox="0 0 100 10" preserveAspectRatio="none" className="w-full h-4 fill-[#fffdf5] stroke-[#8b5a2b] stroke-[0.5]">
          <path d="M0 0 L5 8 L10 0 L15 8 L20 0 L25 8 L30 0 L35 8 L40 0 L45 8 L50 0 L55 8 L60 0 L65 8 L70 0 L75 8 L80 0 L85 8 L90 0 L95 8 L100 0 V10 H0 Z" />
        </svg>
      </div>

      {/* Footer stamp */}
      <div className="mt-4 flex justify-center">
        <div className="rotate-[-10deg] border-2 border-[#90be6d]/40 px-2 py-0.5 rounded text-[#90be6d]/60 text-[8px] font-black uppercase">
          Confirmed
        </div>
      </div>
    </motion.div>
  );
}