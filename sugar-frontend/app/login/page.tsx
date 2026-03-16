"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, Sparkles, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false, // Handle redirect manually for a smoother experience
        callbackUrl: "/",
      });

      if (result?.error) {
        setIsLoading(false);
        alert("Check your honey and try again! 🍯"); 
      } else {
        // Force a refresh so the Header picks up the new Sakura avatar session
        window.location.href = "/"; 
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#F0EBD1] relative overflow-hidden">
      {/* Decorative Floating Sparkles */}
      <motion.div 
        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute top-20 left-10 text-[#FFB347] opacity-40 hidden md:block"
      >
        <Sparkles size={40} />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px] bg-white/80 backdrop-blur-xl p-10 rounded-[3rem] border-[3px] border-[#F4C2C2] shadow-[12px_12px_0px_#D4A24C] relative z-10"
      >
        {/* Cute Mascot Header */}
        <div className="text-center mb-10">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: -5 }}
            className="inline-block mb-4 text-4xl text-fuchsia-300"
          >
            ૮₍ ˶ᵔ ᵕ ᵔ˶ ₎ა
          </motion.div>
          <h1 className="text-2xl font-black text-[#8A5559] tracking-tight">Honey Login</h1>
          <div className="h-1 w-12 bg-[#FFB347] mx-auto mt-2 rounded-full"></div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4A24C] transition-transform group-focus-within:scale-110" size={18} />
            <input
              type="email"
              placeholder="Your email..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-[#F6D6E0] focus:border-[#FFB347] bg-[#FDF6F8]/50 outline-none transition-all font-bold text-[#8A5559] text-sm"
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4A24C] transition-transform group-focus-within:scale-110" size={18} />
            <input
              type="password"
              placeholder="Secret password..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-[#F6D6E0] focus:border-[#FFB347] bg-[#FDF6F8]/50 outline-none transition-all font-bold text-[#8A5559] text-sm"
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02, backgroundColor: "#e6a13d" }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-[#FFB347] text-white font-black py-4 rounded-2xl shadow-[0px_5px_0px_#D4A24C] text-sm uppercase tracking-widest transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Entering...
              </>
            ) : (
              "Enter the Hive ✨"
            )}
          </motion.button>
        </form>

        <div className="relative my-10 flex items-center justify-center">
          <div className="absolute w-full h-[2px] bg-[#F4C2C2]/30"></div>
          <span className="bg-white/90 px-3 relative z-10 text-[#8A5559]/50 font-black text-[10px] uppercase tracking-tighter italic">social login</span>
        </div>

        {/* Google Login */}
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-[#F6D6E0] py-3 rounded-2xl font-black text-[#8A5559] text-sm hover:bg-[#FDF6F8] transition-all shadow-sm"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
          Google Login
        </button>

        <p className="mt-8 text-center text-[#8A5559]/40 text-xs font-bold uppercase tracking-widest">
          New here? <span className="text-[#D4A24C] underline cursor-pointer hover:text-[#8A5559]">Create Account</span>
        </p>

        {/* Floating Sticker */}
        <div className="absolute -bottom-4 -right-4 bg-[#FFB347] text-white p-2 rounded-xl rotate-12 shadow-lg font-black text-[10px] uppercase">
          Stay Sweet!
        </div>
      </motion.div>
    </div>
  );
}