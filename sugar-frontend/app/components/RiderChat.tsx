"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Phone, MessageSquare, User, Loader2, BellRing } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  progress: number;
  deliveryTime: string;
}

type Message = { role: 'rider' | 'user'; text: string };

export default function RiderChat({ progress, deliveryTime }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. PERSISTENCE: Load from localStorage on mount
  useEffect(() => {
    const savedChat = localStorage.getItem("honey_haze_chat");
    if (savedChat) {
      setMessages(JSON.parse(savedChat));
    } else {
      setMessages([{ role: 'rider', text: "Hey! I've picked up your treats. On my way! 🍩" }]);
    }
    
    const missedNotif = localStorage.getItem("honey_haze_unread");
    if (missedNotif === "true") setHasNewMessage(true);
  }, []);

  // 2. PERSISTENCE: Save to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("honey_haze_chat", JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll chat
  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, isTyping]);

  // Helper to trigger notification
  const triggerNotification = () => {
    if (!isOpen) {
      setHasNewMessage(true);
      setShowNotification(true);
      localStorage.setItem("honey_haze_unread", "true");
      // Auto-hide popup after 4 seconds
      setTimeout(() => setShowNotification(false), 4000);
    }
  };

  // Handle Arrival Notification
  useEffect(() => {
    if (progress >= 100) {
      const arrivalMsg = "Sir apnar barir gate er samne chole esechi, please order ta receive koren! Also, please consider adding a tip if you liked the service! 🙏✨";
      
      setMessages(prev => {
        if (prev.some(m => m.text.includes("barir gate er samne"))) return prev;
        triggerNotification();
        return [...prev, { role: 'rider', text: arrivalMsg }];
      });
    }
  }, [progress, isOpen]);

  // Clear Red Dot when user opens chat
  useEffect(() => {
    if (isOpen) {
      setHasNewMessage(false);
      setShowNotification(false);
      localStorage.setItem("honey_haze_unread", "false");
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput("");
    
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const res = await fetch("/api/rider-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, riderName: "Sagor", progress }),
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { role: 'rider', text: data.text }]);
      triggerNotification();
    } catch {
      setMessages(prev => [...prev, { role: 'rider', text: "Signal is weak in this alley! 🛵" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="relative">
      {/* NOTIFICATION POPUP */}
      <AnimatePresence>
        {showNotification && !isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: -60, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute left-0 right-0 flex justify-center z-50 pointer-events-none"
          >
            <div className="bg-[#8b5a2b] text-white px-4 py-2 rounded-full shadow-lg border-2 border-white flex items-center gap-2 pointer-events-auto cursor-pointer" onClick={() => setIsOpen(true)}>
              <BellRing size={14} className="animate-bounce" />
              <span className="text-[10px] font-black uppercase tracking-wider">You got a text from Sagor!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white border-2 border-[#8b5a2b] rounded-2xl shadow-[4px_4px_0px_#8b5a2b] overflow-hidden">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b-2 border-[#8b5a2b]/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-[#FFE6ED] rounded-full border-2 border-[#8b5a2b] flex items-center justify-center">
               <User className="text-[#8b5a2b]" size={20} />
            </div>
            <div>
              <h4 className="text-xs font-black text-[#8b5a2b] uppercase">Sagor (Rider)</h4>
              <p className="text-[10px] font-bold text-[#90be6d] flex items-center gap-1">
                <span className={progress < 100 ? "animate-pulse" : ""}>●</span> 
                {progress < 100 ? 'On the way' : 'Arrived at location'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 bg-[#fdfcf0] border-2 border-[#8b5a2b] rounded-xl text-[#8b5a2b] hover:bg-[#FFE6ED] transition-colors">
              <Phone size={16} />
            </button>
            
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 border-2 border-[#8b5a2b] rounded-xl transition-all relative ${
                isOpen ? 'bg-[#8b5a2b] text-white' : 'bg-[#fdfcf0] text-[#8b5a2b]'
              }`}
            >
              <MessageSquare size={16} />
              
              {/* PERSISTENT RED DOT */}
              <AnimatePresence>
                {hasNewMessage && !isOpen && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center z-10"
                  >
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Chat Body */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ height: 0 }} 
              animate={{ height: 320 }} 
              exit={{ height: 0 }}
              className="flex flex-col bg-[#fdfcf0]"
            >
              <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-2 rounded-xl text-[10px] font-bold shadow-sm ${
                      m.role === 'user' 
                        ? 'bg-[#8b5a2b] text-white rounded-tr-none' 
                        : 'bg-white border border-[#8b5a2b]/20 text-[#8b5a2b] rounded-tl-none'
                    }`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white p-2 rounded-xl border border-[#8b5a2b]/20">
                      <Loader2 size={12} className="animate-spin text-[#8b5a2b]" />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-3 border-t-2 border-[#8b5a2b]/10 flex gap-2 bg-white">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask Sagor anything..."
                  className="flex-grow bg-[#fdfcf0] border-2 border-[#8b5a2b] rounded-lg px-3 py-1 text-[10px] font-bold focus:outline-none"
                />
                <button onClick={handleSend} className="p-2 bg-[#90be6d] text-white rounded-lg border-2 border-[#8b5a2b] shadow-[2px_2px_0px_#8b5a2b] active:translate-y-0.5 active:shadow-none transition-all">
                  <Send size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}