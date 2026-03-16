'use client';
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Trash2, ArrowLeft, Sparkles, Heart, Zap } from "lucide-react";
import Link from "next/link";
import RiderReview from "../components/RiderReview";

type Review = {
  id: number;
  name: string;
  comment: string;
  rating: number;
  avatar?: string;
  timestamp?: number;
  orderId?: string; 
  items?: string[]; 
};

export default function Reviews() {
  const defaultAvatars = [
    "/images/avatars/sakura.jpg",
    "/images/avatars/cupcake.jpg",
    "/images/avatars/pancake.jpg",
    "/images/avatars/coffee.jpg",
    "/images/avatars/cake.jpg"
  ];

  const [reviews, setReviews] = useState<Review[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newReview, setNewReview] = useState({ name: "", comment: "", rating: 5 });
  const [tooltipId, setTooltipId] = useState<number | null>(null);
  const [filter, setFilter] = useState("all");
  const [showRiderReview, setShowRiderReview] = useState(false);

  const editContainerRef = useRef<HTMLDivElement>(null);
  const backupReviews = useRef<Review[]>([]);

  useEffect(() => {
    // 1. Load Reviews
    const saved = localStorage.getItem("honey_haze_public_reviews");
    if (saved) {
      const parsed = JSON.parse(saved);
      setReviews(parsed);
      backupReviews.current = parsed;
    }

    // 2. Check for completed but un-finalized deliveries
    const checkDeliveryStatus = () => {
      const savedOrders = localStorage.getItem("honey_haze_orders");
      const savedAccepted = localStorage.getItem("honey_haze_accepted");
      
      if (savedOrders) {
        const orders = JSON.parse(savedOrders);
        const acceptedMap = savedAccepted ? JSON.parse(savedAccepted) : {};
        
        const hasCompletedDelivery = orders.some((order: any) => {
          const packingDuration = 20000; 
          const deliveryDuration = 40000; 
          const elapsed = Date.now() - order.startTime;
          const progress = ((elapsed - packingDuration) / deliveryDuration) * 100;
          
          return progress >= 100 && !acceptedMap[order.id];
        });

        setShowRiderReview(hasCompletedDelivery);
      }
    };

    checkDeliveryStatus();
    const interval = setInterval(checkDeliveryStatus, 5000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem("honey_haze_public_reviews", JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editContainerRef.current && !editContainerRef.current.contains(event.target as Node)) {
        if (editingId !== null) {
          setReviews(backupReviews.current);
          setEditingId(null);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [editingId]);

  const handleRiderSave = (data: { stars: number; text: string } | null) => {
    if (data) {
      const riderEntry: Review = {
        id: Date.now(),
        name: "Verified Customer",
        comment: data.text,
        rating: data.stars,
        avatar: "/images/avatars/coffee.jpg",
        timestamp: Date.now(),
        orderId: `HH-${Math.floor(1000 + Math.random() * 9000)}`,
        items: ["Cloud Delivery"]
      };
      const updated = [riderEntry, ...reviews];
      setReviews(updated);
      backupReviews.current = updated;
      setShowRiderReview(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, id?: number) => {
    if (id !== undefined) {
      setReviews(reviews.map(r => r.id === id ? { ...r, [e.target.name]: e.target.value } : r));
    } else {
      setNewReview({ ...newReview, [e.target.name]: e.target.value });
    }
  };

  const handleStarClick = (rating: number, id?: number) => {
    if (id !== undefined) {
      if (editingId === id) {
        setReviews(reviews.map(r => r.id === id ? { ...r, rating } : r));
      } else {
        setTooltipId(id);
        setTimeout(() => setTooltipId(null), 1200);
      }
    } else {
      setNewReview({ ...newReview, rating });
    }
  };

  const handleSaveChanges = (id: number) => {
    const originalReview = backupReviews.current.find(r => r.id === id);
    const editedReview = reviews.find(r => r.id === id);

    if (originalReview && editedReview) {
      if (editedReview.rating < originalReview.rating) {
        const revertedReviews = reviews.map(r => 
          r.id === id ? { ...r, rating: originalReview.rating } : r
        );
        setReviews(revertedReviews);
        backupReviews.current = revertedReviews;
      } else {
        backupReviews.current = [...reviews];
      }
    }
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name.trim() || !newReview.comment.trim()) return;

    const randomAvatar = defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];
    const reviewToAdd = { 
        id: Date.now(), 
        ...newReview, 
        avatar: randomAvatar,
        timestamp: Date.now() 
    };
    
    const updated = [reviewToAdd, ...reviews];
    setReviews(updated);
    backupReviews.current = updated;
    setNewReview({ name: "", comment: "", rating: 5 });
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Remove this review from history?")) {
      const updated = reviews.filter(r => r.id !== id);
      setReviews(updated);
      backupReviews.current = updated;
    }
  };

  const filteredReviews = reviews.filter(r => {
    if (filter === "high") return r.rating >= 4;
    return true;
  }).sort((a, b) => {
    if (filter === "recent") return (b.timestamp || 0) - (a.timestamp || 0);
    return 0;
  });

  const renderStars = (review: Review, isEditing: boolean) => (
    <div className="relative flex text-3xl text-[#D4A24C]">
      {[1, 2, 3, 4, 5].map(starValue => (
        <motion.span
          key={starValue}
          whileHover={isEditing ? { scale: 1.3, rotate: 15 } : {}}
          className={`cursor-pointer transition-colors ${starValue <= review.rating ? "text-[#D4A24C]" : "text-[#D4A24C]/20"}`}
          onClick={() => handleStarClick(starValue, review.id)}
        >
          ★
        </motion.span>
      ))}
      <AnimatePresence>
        {tooltipId === review.id && !isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: -30, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -top-10 left-0 bg-[#C98895] text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-full shadow-[4px_4px_0_#8b5a2b] whitespace-nowrap z-10"
          >
            Click 'Edit' to change rating 👀
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <section className="pt-32 pb-32 bg-[#F0EBD1] flex flex-col items-center gap-12 min-h-screen relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-20 left-[10%] opacity-20 rotate-12 text-[#C98895]"><Sparkles size={120} /></div>
      <div className="absolute bottom-20 right-[10%] opacity-10 -rotate-12 text-[#D4A24C]"><Zap size={160} /></div>

      <div className="text-center relative z-10">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl md:text-8xl font-black text-[#C98895] mb-4 drop-shadow-sm"
        >
          Review <span className="text-[#8b5a2b]">Hive</span>
        </motion.h1>
        <p className="text-[#8b5a2b] font-black uppercase text-xs tracking-[0.4em] bg-white/50 inline-block px-4 py-1 rounded-full">The Feedback Archive</p>
      </div>

      <AnimatePresence>
        {showRiderReview && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full flex justify-center z-20"
          >
            <div className="border-4 border-dashed border-[#C98895] p-2 rounded-[2.5rem]">
                <RiderReview riderName="Swift Saffron" onSave={handleRiderSave} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-3 bg-white/60 p-2 rounded-[2rem] border-4 border-[#D4A24C]/20 shadow-xl backdrop-blur-sm z-10">
        {['all', 'high', 'recent'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase transition-all ${
              filter === f 
              ? "bg-[#C98895] text-white shadow-[4px_4px_0_#8b5a2b] -translate-y-1" 
              : "text-[#C98895] hover:bg-white/80"
            }`}
          >
            {f === 'high' ? 'Top Rated' : f}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-10 w-full max-w-5xl px-6 relative z-10" ref={editContainerRef}>
        <AnimatePresence mode="popLayout">
          {filteredReviews.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 text-[#C98895]/40 font-black uppercase text-sm italic tracking-widest"
            >
              The hive is quiet... Leave a note! 🌸
            </motion.div>
          ) : (
            filteredReviews.map((review, idx) => {
              const isEditing = editingId === review.id;
              return (
                <motion.div
                  key={review.id}
                  layout
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col md:flex-row items-center md:items-start gap-8 bg-white/95 backdrop-blur-md rounded-[3rem] shadow-[12px_12px_0_rgba(201,136,149,0.1)] p-10 border-4 border-[#D4A24C]/10 hover:border-[#D4A24C]/40 transition-all group"
                >
                  <div className="relative shrink-0">
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-[#D4A24C] shadow-lg"
                    >
                        <img src={review.avatar || defaultAvatars[0]} alt={review.name} className="w-full h-full object-cover" />
                    </motion.div>
                    {review.orderId && (
                      <div className="absolute -bottom-3 -right-3 bg-[#9CAF88] text-white text-[9px] font-black px-3 py-1.5 rounded-full border-2 border-white shadow-md transform -rotate-12 uppercase">
                        Verified
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col w-full gap-4">
                    <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
                      {isEditing ? (
                        <input
                          type="text"
                          name="name"
                          value={review.name}
                          onChange={(e) => handleChange(e, review.id)}
                          className="text-[#C98895] font-black text-2xl p-3 rounded-2xl border-2 border-[#D4A24C] focus:outline-none bg-[#FDF6F8] w-full md:w-auto"
                        />
                      ) : (
                        <div className="text-center md:text-left">
                          <h3 className="text-3xl font-black text-[#C98895] flex items-center justify-center md:justify-start gap-3">
                            {review.name}
                            {review.rating === 5 && <span className="text-[9px] bg-[#D4A24C] text-white px-3 py-1 rounded-full uppercase tracking-tighter">Elite Honey</span>}
                          </h3>
                          {review.items && (
                            <p className="text-[10px] text-[#8b5a2b]/60 font-black uppercase mt-1">Ordered: {review.items.join(" • ")}</p>
                          )}
                        </div>
                      )}
                      <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!isEditing && (
                          <button onClick={() => setEditingId(review.id)} className="text-[11px] font-black uppercase text-[#D4A24C] hover:scale-110 transition-transform">Edit</button>
                        )}
                        <button onClick={() => handleDelete(review.id)} className="text-[11px] font-black uppercase text-[#C98895] hover:scale-110 transition-transform">Delete</button>
                      </div>
                    </div>

                    <div className="flex justify-center md:justify-start">{renderStars(review, isEditing)}</div>

                    {isEditing ? (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-2 space-y-4">
                        <textarea
                          name="comment"
                          value={review.comment}
                          onChange={(e) => handleChange(e, review.id)}
                          rows={3}
                          className="w-full p-5 rounded-3xl border-2 border-[#D4A24C] text-[#8b5a2b] font-medium focus:outline-none bg-[#FDF6F8]"
                        />
                        <button
                          onClick={() => handleSaveChanges(review.id)}
                          className="bg-[#C98895] text-white font-black py-4 px-10 rounded-2xl shadow-[4px_4px_0_#8b5a2b] text-[11px] uppercase tracking-[0.2em] active:translate-y-1 active:shadow-none transition-all"
                        >
                          Update Record ✨
                        </button>
                      </motion.div>
                    ) : (
                      <p className="text-[#8b5a2b] mt-2 text-xl leading-relaxed italic font-medium text-center md:text-left px-4 md:px-0">
                        "{review.comment}"
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        className="relative z-10 flex flex-col gap-6 w-full max-w-xl bg-white rounded-[3.5rem] shadow-[20px_20px_0_rgba(212,162,76,0.1)] p-12 mt-16 border-4 border-[#D4A24C]/20"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="text-center">
            <Heart className="mx-auto mb-4 text-[#C98895] fill-[#C98895]/20" size={40} />
            <h2 className="text-3xl font-black text-[#8b5a2b] uppercase tracking-tighter">Seal it with a note</h2>
            <p className="text-[10px] font-black uppercase text-[#D4A24C] tracking-[0.4em] mt-2">Share the Honey</p>
        </div>

        <div className="flex justify-center gap-2 mb-2">
          {[1, 2, 3, 4, 5].map(starValue => (
            <motion.span
              key={starValue}
              whileHover={{ scale: 1.3, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              className={`cursor-pointer text-5xl transition-colors ${starValue <= newReview.rating ? "text-[#D4A24C]" : "text-[#F0EBD1]"}`}
              onClick={() => handleStarClick(starValue)}
            >
              ★
            </motion.span>
          ))}
        </div>

        <div className="space-y-4">
            <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={newReview.name}
            onChange={handleChange}
            className="w-full p-6 rounded-[1.8rem] border-2 border-[#D4A24C]/10 focus:border-[#D4A24C] focus:outline-none placeholder:text-[#8b5a2b]/30 text-[#8b5a2b] font-bold bg-[#FDF6F8] transition-all"
            required
            />

            <textarea
            name="comment"
            placeholder="How was the experience?"
            rows={4}
            value={newReview.comment}
            onChange={handleChange}
            className="w-full p-6 rounded-[1.8rem] border-2 border-[#D4A24C]/10 focus:border-[#D4A24C] focus:outline-none placeholder:text-[#8b5a2b]/30 text-[#8b5a2b] font-bold bg-[#FDF6F8] transition-all"
            required
            />
        </div>

        <button
          type="submit"
          className="bg-[#D4A24C] hover:bg-[#8b5a2b] text-white font-black uppercase text-xs py-6 px-8 rounded-3xl shadow-[6px_6px_0_#C98895] transition-all hover:-translate-y-1 active:translate-y-1 active:shadow-none"
        >
          Post to Archive ✨
        </button>
      </motion.form>
    </section>
  );
}