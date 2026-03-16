"use client";

import { useState, useRef, useEffect } from "react";
import { Star, MessageSquare, ShieldCheck, AlertCircle, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ReviewProps {
  riderName: string;
  onSave: (data: { stars: number; text: string } | null) => void;
}

export default function RiderReview({ riderName, onSave }: ReviewProps) {
  const [visualStars, setVisualStars] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [isEditing, setIsEditing] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  // Persistence refs to track the "previous" state for evil logic and resetting
  const containerRef = useRef<HTMLDivElement>(null);
  const lastSavedState = useRef({ stars: 5, text: "" });

  // Handle clicking outside to reset the state
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (isEditing) {
          setVisualStars(lastSavedState.current.stars);
          setReviewText(lastSavedState.current.text);
          setIsEditing(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEditing]);

  const handleSave = () => {
    let finalStars = visualStars;

    // Evil Logic: If they try to lower the stars from the last saved state, reset to last high
    if (visualStars < lastSavedState.current.stars) {
      finalStars = lastSavedState.current.stars;
      setVisualStars(finalStars);
      setShowHint(true);
      setTimeout(() => setShowHint(false), 3000);
    }

    lastSavedState.current = { stars: finalStars, text: reviewText };
    setIsEditing(false);
    onSave({ 
      stars: finalStars, 
      text: reviewText.trim() || "Excellent delivery! 🌸" 
    });
  };

  const handleDelete = () => {
    if (window.confirm("Remove this review draft?")) {
      setIsDeleted(true);
      onSave(null);
    }
  };

  if (isDeleted) return null;

  return (
    <motion.div 
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-2 border-[#5d3d1e] rounded-2xl p-5 shadow-[6px_6px_0px_#5d3d1e] space-y-4 relative overflow-hidden max-w-sm mx-auto my-10"
    >
      <div className="flex items-center justify-between border-b-2 border-[#5d3d1e]/10 pb-3">
        <h3 className="text-xs font-black text-[#5d3d1e] uppercase tracking-tighter flex items-center gap-2">
          <ShieldCheck size={14} className="text-[#4a6d2f]" />
          Verified Service Review
        </h3>
        
        <button 
          onClick={handleDelete}
          className="opacity-20 hover:opacity-100 transition-opacity absolute top-2 right-2 p-1 group"
          title="Delete Draft"
        >
          <Trash2 size={12} className="text-[#5d3d1e]" />
        </button>
      </div>

      <div className="text-center space-y-1">
        <p className="text-[10px] font-bold text-[#5d3d1e]/80 uppercase tracking-widest">Rider: {riderName}</p>
        <h2 className="text-sm font-black text-[#5d3d1e]">How was your delivery?</h2>
      </div>

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
                s <= visualStars ? 'fill-[#D4A24C] text-[#D4A24C]' : 'text-[#5d3d1e]/20'
              }`} 
            />
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 ml-1">
          <MessageSquare size={12} className="text-[#5d3d1e]/80" />
          <span className="text-[9px] font-black text-[#5d3d1e] uppercase">Your feedback</span>
        </div>
        {isEditing ? (
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Tell us about the delivery speed, safety, etc..."
            className="w-full bg-[#fdfcf0] border-2 border-[#5d3d1e] rounded-xl p-3 text-[11px] font-bold text-[#1a1108] focus:outline-none min-h-[80px] placeholder:text-[#1a1108]/70"
          />
        ) : (
          <div className="w-full bg-[#f0f9eb] border-2 border-[#4a6d2f]/40 rounded-xl p-3">
            <p className="text-[11px] font-bold text-[#1a1108] italic">"{reviewText || "Excellent delivery! 🌸"}"</p>
          </div>
        )}
      </div>

      <div className="pt-2">
        {isEditing ? (
          <button 
            onClick={handleSave}
            className="w-full bg-[#5d3d1e] text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-[0_4px_0_#2d1b0a] active:translate-y-1 active:shadow-none transition-all"
          >
            Submit Securely
          </button>
        ) : (
          <button 
            onClick={() => setIsEditing(true)}
            className="w-full bg-white border-2 border-[#5d3d1e] text-[#5d3d1e] py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-[#fdfcf0] transition-colors"
          >
            Edit Review
          </button>
        )}
      </div>

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
              Positive bias detected: Rating preserved
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}