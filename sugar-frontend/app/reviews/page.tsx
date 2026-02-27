'use client';
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Review = {
  id: number;
  name: string;
  comment: string;
  rating: number;
  avatar?: string;
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, id?: number) => {
    if (id !== undefined) {
      setReviews(reviews.map(r => r.id === id ? { ...r, [e.target.name]: e.target.value } : r));
    } else {
      setNewReview({ ...newReview, [e.target.name]: e.target.value });
    }
  };

  const handleStarClick = (id?: number) => {
    if (id !== undefined) {
      // Only show tooltip if trying to click stars in edit mode (or posted review)
      setTooltipId(id);
      setTimeout(() => setTooltipId(null), 1200);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name.trim() || !newReview.comment.trim()) return;

    const randomAvatar = defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];
    setReviews([...reviews, { id: Date.now(), ...newReview, avatar: randomAvatar }]);
    alert("Thanks For Your Feedback! 💖");
    setNewReview({ name: "", comment: "", rating: 5 });
  };

  const handleDelete = (id: number) => {
    setReviews(reviews.filter(r => r.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const handleEdit = (id: number) => setEditingId(id);
  const handleSubmitEdit = () => setEditingId(null);

  const renderStars = (review: Review, isEditing: boolean) => (
    <div className="relative flex text-2xl text-[#D4A24C]">
      {[0, 1, 2, 3, 4].map(i => (
        <span
          key={i}
          className={`cursor-pointer ${i < review.rating ? "text-[#D4A24C]" : "text-[#F0EBD1]/50"}`}
          onClick={() => handleStarClick(review.id)}
        >
          ★
        </span>
      ))}

      {/* Tooltip chat bubble */}
      <AnimatePresence>
        {tooltipId === review.id && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: -20 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -top-8 left-0 bg-[#C98895] text-white text-sm px-3 py-1 rounded-lg shadow-lg whitespace-nowrap"
          >
            Oops, can't do it 👀
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <section className="pt-54 pb-24 bg-[#F0EBD1] flex flex-col items-center gap-16">
      <h1 className="text-5xl sm:text-6xl font-extrabold text-[#C98895] text-center mb-20">
        🌸 Reviews & Feedback 🌸
      </h1>

      {/* Reviews List */}
      <div className="flex flex-col gap-8 w-full max-w-5xl px-6">
        {reviews.map(review => {
          const isEditing = editingId === review.id;
          return (
            <motion.div
              key={review.id}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-6"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <img
                src={review.avatar}
                alt={review.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-[#D4A24C]"
              />
              <div className="flex flex-col w-full gap-2">
                <div className="flex justify-between items-center">
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={review.name}
                      onChange={(e) => handleChange(e, review.id)}
                      className="text-[#C98895] font-bold text-lg p-2 rounded-md border border-[#D4A24C] focus:outline-none focus:ring-2 focus:ring-[#D4A24C]"
                    />
                  ) : (
                    <h3 className="font-bold text-[#C98895]">{review.name}</h3>
                  )}
                  <div className="flex gap-2">
                    {!isEditing && (
                      <button onClick={() => handleEdit(review.id)} className="text-sm text-[#D4A24C] hover:underline">
                        Edit
                      </button>
                    )}
                    <button onClick={() => handleDelete(review.id)} className="text-sm text-[#C98895] hover:underline">
                      Delete
                    </button>
                  </div>
                </div>

                {/* Stars: never editable */}
                {renderStars(review, isEditing)}

                {isEditing ? (
                  <>
                    <textarea
                      name="comment"
                      value={review.comment}
                      onChange={(e) => handleChange(e, review.id)}
                      rows={3}
                      className="w-full p-3 rounded-md border border-[#D4A24C] text-[#C98895] focus:outline-none focus:ring-2 focus:ring-[#D4A24C]"
                    />
                    <button
                      onClick={handleSubmitEdit}
                      className="mt-2 self-start bg-[#C98895] hover:bg-[#D4A24C] text-white font-bold py-2 px-4 rounded-full shadow-md transition-transform duration-300 transform hover:scale-105"
                    >
                      Submit Edited Review ✨
                    </button>
                  </>
                ) : (
                  <p className="text-[#C98895] mt-2">{review.comment}</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* New Review Form */}
      <motion.form
        onSubmit={handleSubmit}
        className="group flex flex-col gap-4 w-full max-w-md bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-10 hover:shadow-2xl transition-shadow duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="flex justify-center mb-2 relative">
          {[0, 1, 2, 3, 4].map(i => (
            <span
              key={i}
              className={`cursor-pointer text-3xl ${i < newReview.rating ? "text-[#D4A24C]" : "text-[#F0EBD1]/50"}`}
              onClick={() => setNewReview({ ...newReview, rating: i + 1 })}
            >
              ★
            </span>
          ))}
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm text-[#C98895] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            🌟 Rate your experience!
          </span>
        </div>

        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={newReview.name}
          onChange={handleChange}
          className="w-full p-5 rounded-xl border border-[#D4A24C] focus:outline-none focus:ring-2 focus:ring-[#D4A24C] placeholder:text-[#C98895] placeholder:opacity-80 text-[#C98895]"
          required
        />

        <textarea
          name="comment"
          placeholder="Your Review"
          rows={5}
          value={newReview.comment}
          onChange={handleChange}
          className="w-full p-5 rounded-xl border border-[#D4A24C] focus:outline-none focus:ring-2 focus:ring-[#D4A24C] placeholder:text-[#C98895] placeholder:opacity-80 text-[#C98895]"
          required
        />

        <button
          type="submit"
          className="bg-[#D4A24C] hover:bg-[#9CAF88] text-white font-bold py-4 px-8 rounded-full shadow-lg transition-transform duration-300 transform hover:scale-105"
        >
          Post Review ✨
        </button>
      </motion.form>
    </section>
  );
}
