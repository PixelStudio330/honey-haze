"use client";

import { useState } from "react";
import { Star, MessageSquare, ShieldCheck, AlertCircle, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ReviewProps {
  riderName: string;
  onSave: (data: { stars: number; text: string } | null) => void;
}

export default function RiderReview({ riderName, onSave }: ReviewProps) {
  const [stars, setStars] = useState(5); 
  const [visualStars, setVisualStars] = useState(5); 
  const [reviewText, setReviewText] = useState("");
  const [isEditing, setIsEditing] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const handleSave = () => {
    // If they try to rate lower than 5, we "preserve" the quality ;)
    if (visualStars < 5) {
      setVisualStars(5);
      setStars(5);
      setShowHint(true);
      setTimeout(() => setShowHint(false), 3000);
    } else {
      setStars(visualStars);
    }
    
    setIsEditing(false);
    onSave({ stars: 5, text: reviewText });
  };

  const handleDelete = () => {
    setIsDeleted(true);
    onSave(null);
  };

  if (isDeleted) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-2 border-[#8b5a2b] rounded-2xl p-5 shadow-[6px_6px_0px_#8b5a2b] space-y-4 relative overflow-hidden"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between border-b-2 border-[#8b5a2b]/10 pb-3">
        <h3 className="text-xs font-black text-[#8b5a2b] uppercase tracking-tighter flex items-center gap-2">
          <ShieldCheck size={14} className="text-[#90be6d]" />
          Verified Service Review
        </h3>
        
        {/* THE "HIDDEN" DELETE BUTTON */}
        {/* Tiny, low opacity, and blends with the border color */}
        <button 
          onClick={handleDelete}
          className="opacity-[0.08] hover:opacity-100 transition-opacity absolute top-1 right-1 p-1 group"
          title="Delete"
        >
          <Trash2 size={8} className="text-[#8b5a2b]" />
        </button>
      </div>

      <div className="text-center space-y-1">
        <p className="text-[10px] font-bold text-[#8b5a2b]/60 uppercase">Rider: {riderName}</p>
        <h2 className="text-sm font-black text-[#8b5a2b]">How was your delivery?</h2>
      </div>

      {/* STAR RATING */}
      <div className="flex justify-center gap-2 py-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            disabled={!isEditing}
            onClick={() => setVisualStars(s)}
            className={`transition-transform ${isEditing ? 'active:scale-90 hover:scale-110' : 'cursor-default'}`}
          >
            <Star 
              size={28} 
              className={`transition-colors duration-300 ${
                s <= visualStars 
                ? 'fill-[#D4A24C] text-[#D4A24C]' 
                : 'text-[#8b5a2b]/20'
              }`} 
            />
          </button>
        ))}
      </div>

      {/* TEXT REVIEW */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 ml-1">
          <MessageSquare size={12} className="text-[#8b5a2b]/40" />
          <span className="text-[9px] font-black text-[#8b5a2b] uppercase">Your feedback</span>
        </div>
        {isEditing ? (
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Tell us about the delivery speed, safety, etc..."
            className="w-full bg-[#fdfcf0] border-2 border-[#8b5a2b] rounded-xl p-3 text-[11px] font-bold focus:outline-none min-h-[80px] placeholder:text-[#8b5a2b]/30"
          />
        ) : (
          <div className="w-full bg-[#f0f9eb] border-2 border-[#90be6d]/20 rounded-xl p-3">
            <p className="text-[11px] font-bold text-[#5a7d32] italic">"{reviewText || "Great service!"}"</p>
          </div>
        )}
      </div>

      {/* ACTION BUTTONS */}
      <div className="pt-2">
        {isEditing ? (
          <button 
            onClick={handleSave}
            className="w-full bg-[#8b5a2b] text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-[0_4px_0_#5d3d1e] active:translate-y-1 transition-all"
          >
            Submit Securely
          </button>
        ) : (
          <button 
            onClick={() => setIsEditing(true)}
            className="w-full bg-white border-2 border-[#8b5a2b] text-[#8b5a2b] py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-[#fdfcf0] transition-colors"
          >
            Edit Review
          </button>
        )}
      </div>

      {/* THE "EVIL" HINT */}
      <AnimatePresence>
        {showHint && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute inset-x-0 bottom-2 px-5 pointer-events-none"
          >
            <div className="bg-[#CF7486] text-white text-[9px] font-black uppercase p-2 rounded-lg flex items-center justify-center gap-2 shadow-lg">
              <AlertCircle size={10} />
              Positive bias detected: Rating preserved for rider safety
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}