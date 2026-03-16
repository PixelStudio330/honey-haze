'use client';
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MessageSquare, ShieldCheck, AlertCircle, Trash2, ArrowLeft } from "lucide-react";
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
  
  // New state to track if a delivery is actually ready for review
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
          
          // Show if 100% done AND not yet finalized/archived
          return progress >= 100 && !acceptedMap[order.id];
        });

        setShowRiderReview(hasCompletedDelivery);
      }
    };

    checkDeliveryStatus();
    const interval = setInterval(checkDeliveryStatus, 5000); // Poll every 5s
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
      
      // Hide the rider review component after saving
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
    <div className="relative flex text-2xl text-[#D4A24C]">
      {[1, 2, 3, 4, 5].map(starValue => (
        <span
          key={starValue}
          className={`cursor-pointer transition-transform ${isEditing ? 'hover:scale-125' : ''} ${starValue <= review.rating ? "text-[#D4A24C]" : "text-[#F0EBD1]/50"}`}
          onClick={() => handleStarClick(starValue, review.id)}
        >
          ★
        </span>
      ))}
      <AnimatePresence>
        {tooltipId === review.id && !isEditing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: -20 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -top-8 left-0 bg-[#C98895] text-white text-[10px] font-black uppercase px-3 py-1 rounded-lg shadow-lg whitespace-nowrap z-10"
          >
            Click 'Edit' to change rating 👀
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <section className="pt-24 pb-24 bg-[#F0EBD1] flex flex-col items-center gap-8 min-h-screen relative">
      <Link href="/orders" className="absolute top-8 left-8 p-3 bg-white rounded-full border-2 border-[#8b5a2b] shadow-[4px_4px_0_#8b5a2b] active:translate-y-1 active:shadow-none transition-all">
        <ArrowLeft size={24} className="text-[#8b5a2b]" />
      </Link>

      <div className="text-center mb-10 pt-20">
        <h1 className="text-5xl sm:text-6xl font-extrabold text-[#C98895] mb-4">
          🌸 Reviews & Feedback 🌸
        </h1>
        <p className="text-[#8b5a2b] font-black uppercase text-[10px] tracking-[0.2em]">The Review Archive</p>
      </div>

      {/* Conditional Rendering Logic Applied Here */}
      <AnimatePresence>
        {showRiderReview && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full flex justify-center overflow-hidden"
          >
            <RiderReview riderName="Swift Saffron" onSave={handleRiderSave} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-4 mb-8 bg-white/50 p-2 rounded-2xl border-2 border-[#D4A24C]/20 shadow-inner">
        {['all', 'high', 'recent'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
              filter === f 
              ? "bg-[#C98895] text-white shadow-md scale-105" 
              : "text-[#C98895] hover:bg-white/50"
            }`}
          >
            {f === 'high' ? 'Top Rated' : f}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-8 w-full max-w-5xl px-6" ref={editContainerRef}>
        <AnimatePresence mode="popLayout">
          {filteredReviews.length === 0 ? (
            <div className="text-center py-10 text-[#C98895]/50 font-bold italic">No reviews found...</div>
          ) : (
            filteredReviews.map(review => {
              const isEditing = editingId === review.id;
              return (
                <motion.div
                  key={review.id}
                  layout
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-8 border-b-4 border-[#D4A24C]/10"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <div className="relative">
                    <img
                      src={review.avatar || defaultAvatars[0]}
                      alt={review.name}
                      className="w-20 h-20 rounded-full object-cover border-2 border-[#D4A24C] shadow-sm"
                    />
                    {review.orderId && (
                      <div className="absolute -bottom-2 -right-2 bg-[#9CAF88] text-white text-[8px] font-black px-2 py-1 rounded-full border-2 border-white uppercase">
                        Verified
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col w-full gap-2">
                    <div className="flex justify-between items-center">
                      {isEditing ? (
                        <input
                          type="text"
                          name="name"
                          value={review.name}
                          onChange={(e) => handleChange(e, review.id)}
                          className="text-[#C98895] font-bold text-lg p-2 rounded-md border border-[#D4A24C] focus:outline-none bg-transparent"
                        />
                      ) : (
                        <div>
                          <h3 className="font-bold text-[#C98895] flex items-center gap-2">
                              {review.name}
                              {review.rating === 5 && <span className="text-[10px] bg-[#D4A24C]/20 px-2 py-0.5 rounded-full">Elite Member</span>}
                          </h3>
                          {review.items && (
                            <p className="text-[9px] text-[#8b5a2b]/50 font-black uppercase">Ordered: {review.items.join(", ")}</p>
                          )}
                        </div>
                      )}
                      <div className="flex gap-4">
                        {!isEditing && (
                          <button onClick={() => setEditingId(review.id)} className="text-[10px] font-black uppercase text-[#D4A24C] hover:underline">
                            Edit
                          </button>
                        )}
                        <button onClick={() => handleDelete(review.id)} className="text-[10px] font-black uppercase text-[#C98895] hover:underline">
                          Delete
                        </button>
                      </div>
                    </div>

                    {renderStars(review, isEditing)}

                    {isEditing ? (
                      <div className="mt-2 space-y-3">
                        <textarea
                          name="comment"
                          value={review.comment}
                          onChange={(e) => handleChange(e, review.id)}
                          rows={3}
                          className="w-full p-3 rounded-md border border-[#D4A24C] text-[#C98895] focus:outline-none bg-transparent"
                        />
                        <button
                          onClick={() => handleSaveChanges(review.id)}
                          className="bg-[#C98895] text-white font-black py-2 px-6 rounded-full shadow-md text-[10px] uppercase tracking-widest active:scale-95 transition-all"
                        >
                          Save Changes ✨
                        </button>
                      </div>
                    ) : (
                      <p className="text-[#C98895] mt-2 text-sm leading-relaxed italic">"{review.comment}"</p>
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
        className="group flex flex-col gap-4 w-full max-w-md bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-10 mt-10 hover:shadow-2xl transition-all duration-300 border-2 border-[#D4A24C]/20"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="text-center mb-4">
          <p className="text-[10px] font-black uppercase text-[#D4A24C] tracking-[0.3em]">Leave a Note</p>
        </div>

        <div className="flex justify-center mb-2">
          {[1, 2, 3, 4, 5].map(starValue => (
            <span
              key={starValue}
              className={`cursor-pointer text-4xl transition-transform hover:scale-125 ${starValue <= newReview.rating ? "text-[#D4A24C]" : "text-[#F0EBD1]/50"}`}
              onClick={() => handleStarClick(starValue)}
            >
              ★
            </span>
          ))}
        </div>

        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={newReview.name}
          onChange={handleChange}
          className="w-full p-4 rounded-xl border border-[#D4A24C]/30 focus:outline-none focus:ring-2 focus:ring-[#D4A24C] placeholder:text-[#C98895]/50 text-[#C98895] bg-transparent"
          required
        />

        <textarea
          name="comment"
          placeholder="How was the experience?"
          rows={4}
          value={newReview.comment}
          onChange={handleChange}
          className="w-full p-4 rounded-xl border border-[#D4A24C]/30 focus:outline-none focus:ring-2 focus:ring-[#D4A24C] placeholder:text-[#C98895]/50 text-[#C98895] bg-transparent"
          required
        />

        <button
          type="submit"
          className="bg-[#D4A24C] hover:bg-[#9CAF88] text-white font-black uppercase text-xs py-5 px-8 rounded-2xl shadow-[4px_4px_0_#C98895] transition-all active:translate-y-1 active:shadow-none"
        >
          Post Review ✨
        </button>
      </motion.form>
    </section>
  );
}