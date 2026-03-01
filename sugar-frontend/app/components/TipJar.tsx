"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, Heart, CheckCircle2 } from "lucide-react";

export function TipJar() {
  const [tip, setTip] = useState(20);
  const [btnPos, setBtnPos] = useState({ x: 0, y: 0 });
  const [isTipped, setIsTipped] = useState(false);

  // The "Evil" Escape: Moves the button when hovered
  const moveButton = () => {
    const randomX = (Math.random() - 0.5) * 240;
    const randomY = (Math.random() - 0.5) * 120;
    setBtnPos({ x: randomX, y: randomY });
  };

  const handleAcceptTip = () => {
    setIsTipped(true);
    // You can call a parent function here to add the tip to the total bill
  };

  return (
    <div className="bg-[#fff9e6] border-2 border-[#D4A24C] rounded-2xl p-4 shadow-[4px_4px_0px_#D4A24C] space-y-4 relative overflow-hidden">
      
      {!isTipped ? (
        <>
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-black text-[#8b5a2b] uppercase flex items-center gap-2">
              <Coins size={14} /> Add a small tip for Sagor?
            </h4>
            <span className="text-xs font-black text-[#D4A24C]">৳ {tip}</span>
          </div>

          <div className="flex gap-2">
            {[10, 20, 30, 50].map((amt) => (
              <button
                key={amt}
                onClick={() => { setTip(amt); setBtnPos({ x: 0, y: 0 }); }}
                className={`flex-1 py-2 rounded-xl text-[10px] font-bold border-2 transition-all ${
                  tip === amt 
                    ? 'bg-[#D4A24C] text-white border-[#8b5a2b]' 
                    : 'bg-white border-[#8b5a2b]/10 text-[#8b5a2b]'
                }`}
              >
                ৳{amt}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <button 
              onClick={handleAcceptTip}
              className="w-full bg-[#90be6d] text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest border-2 border-[#8b5a2b] shadow-[0_4px_0_#5a7d32] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <Heart size={12} fill="white" /> Confirm Tip
            </button>

            <div className="relative h-8 flex items-center justify-center">
              <motion.button
                animate={{ x: btnPos.x, y: btnPos.y }}
                onMouseEnter={moveButton}
                className="absolute text-[9px] font-black text-[#CF7486]/60 uppercase underline decoration-1 underline-offset-4 cursor-pointer whitespace-nowrap"
              >
                No, I'd rather not tip
              </motion.button>
            </div>
          </div>
        </>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-4 flex flex-col items-center justify-center text-center space-y-2"
        >
          <div className="bg-[#90be6d] p-2 rounded-full text-white">
            <CheckCircle2 size={24} />
          </div>
          <p className="text-[11px] font-black text-[#8b5a2b] uppercase">
            ৳{tip} Tip added to order!
          </p>
          <p className="text-[10px] font-bold text-[#90be6d]">
            Always stay kind like this! 🍯
          </p>
        </motion.div>
      )}
    </div>
  );
}