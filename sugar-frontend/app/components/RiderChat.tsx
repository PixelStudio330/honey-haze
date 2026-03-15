"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Phone, User, Loader2, BellRing, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  orderId: string;
  progress: number;
  deliveryTime: string;
}

type Message = { role: 'rider' | 'user'; text: string };

export default function RiderChat({ orderId, progress, deliveryTime }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Initial Load: Sync messages unique to this ORDER ID
  useEffect(() => {
    const CHAT_KEY = `hh_chat_${orderId}`;
    const UNREAD_KEY = `hh_unread_${orderId}`;
    
    const savedChat = localStorage.getItem(CHAT_KEY);
    if (savedChat) {
      setMessages(JSON.parse(savedChat));
    } else {
      setMessages([{ role: 'rider', text: "Assalamualaikum sir! Apnar order packing hocche. 🍩" }]);
    }

    const missedNotif = localStorage.getItem(UNREAD_KEY);
    if (missedNotif === "true") setHasNewMessage(true);
  }, [orderId]); // Only depend on orderId

  // 2. Save Messages to unique storage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`hh_chat_${orderId}`, JSON.stringify(messages));
    }
  }, [messages, orderId]);

  // 3. Auto-scroll
  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTo(0, scrollRef.current.scrollHeight);
    }
  }, [messages, isTyping, isOpen]);

  // 4. Handle Phase Transitions
  useEffect(() => {
    const PACKING_KEY = `hh_sent_packing_${orderId}`;
    const MOVING_KEY = `hh_sent_moving_${orderId}`;
    const ARRIVAL_KEY = `hh_sent_arrival_${orderId}`;
    const UNREAD_KEY = `hh_unread_${orderId}`;

    const notifyUser = () => {
      if (!isOpen) {
        setHasNewMessage(true);
        setShowNotification(true);
        localStorage.setItem(UNREAD_KEY, "true");
      }
    };

    // A. Packing Message
    const alreadySentPacking = localStorage.getItem(PACKING_KEY) === "true";
    if (progress <= 0 && !alreadySentPacking) {
      const packingText = "Sir! Honey Haze e apnar order packing cholche. Just 2 more minutes! 🍯✨";
      setMessages(prev => [...prev, { role: 'rider', text: packingText }]);
      localStorage.setItem(PACKING_KEY, "true");
      notifyUser();
    }

    // B. Moving Message
    const alreadySentMoving = localStorage.getItem(MOVING_KEY) === "true";
    if (progress > 0 && progress < 100 && !alreadySentMoving) {
      const movingText = "Packing done sir! Ami bike niye ber hoye gesi. Rastay ashtesi! 🛵💨";
      setMessages(prev => [...prev, { role: 'rider', text: movingText }]);
      localStorage.setItem(MOVING_KEY, "true");
      notifyUser();
    }

    // C. Arrival Notification
    const alreadySentArrival = localStorage.getItem(ARRIVAL_KEY) === "true";
    if (progress >= 100 && !alreadySentArrival) {
      const arrivalText = "Sir apnar barir gate er samne chole esechi, please order ta receive koren! 🙏✨";
      setMessages(prev => [...prev, { role: 'rider', text: arrivalText }]);
      localStorage.setItem(ARRIVAL_KEY, "true");
      notifyUser();
    }
  }, [progress, isOpen, orderId]); // Clean dependencies

  // 5. Clear notifications
  useEffect(() => {
    if (isOpen) {
      setHasNewMessage(false);
      setShowNotification(false);
      localStorage.setItem(`hh_unread_${orderId}`, "false");
    }
  }, [isOpen, orderId]);

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
        body: JSON.stringify({ message: userMsg, riderName: "Sagor", progress, orderId }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'rider', text: data.text }]);
      
      if (!isOpen) {
        setHasNewMessage(true);
        setShowNotification(true);
        localStorage.setItem(`hh_unread_${orderId}`, "true");
      }
    } catch {
      setMessages(prev => [...prev, { role: 'rider', text: "Signal is weak in this alley! 🛵" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {showNotification && !isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: -50 }}
            exit={{ opacity: 0 }}
            className="absolute left-0 right-0 flex justify-center z-50 pointer-events-none"
          >
            <div className="bg-[#8b5a2b] text-white px-4 py-2 rounded-full shadow-lg border-2 border-white flex items-center gap-2 pointer-events-auto cursor-pointer" onClick={() => setIsOpen(true)}>
              <BellRing size={14} className="animate-bounce" />
              <span className="text-[10px] font-black uppercase">Message from Sagor!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white border-2 border-[#8b5a2b] rounded-3xl shadow-[4px_4px_0px_#8b5a2b] overflow-hidden">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-4 flex items-center justify-between hover:bg-[#fdfcf0] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-[#FFE6ED] rounded-full border-2 border-[#8b5a2b] flex items-center justify-center relative">
              <User className="text-[#8b5a2b]" size={20} />
              {hasNewMessage && !isOpen && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
              )}
            </div>
            <div className="text-left">
              <h4 className="text-[11px] font-black text-[#8b5a2b] uppercase">Sagor (Rider)</h4>
              <p className="text-[9px] font-bold text-[#90be6d]">
                {progress <= 0 ? 'Packing your order...' : progress < 100 ? 'On the way' : 'Arrived at location'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="p-2 bg-[#fdfcf0] border-2 border-[#8b5a2b] rounded-xl text-[#8b5a2b]">
               <Phone size={14} />
             </div>
             {isOpen ? <ChevronUp size={18} className="text-[#8b5a2b]" /> : <ChevronDown size={18} className="text-[#8b5a2b]" />}
          </div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ height: 0 }} 
              animate={{ height: 350 }} 
              exit={{ height: 0 }}
              className="flex flex-col bg-[#fdfcf0] overflow-hidden"
            >
              <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-[10px] font-bold shadow-sm ${
                      m.role === 'user' 
                        ? 'bg-[#8b5a2b] text-white rounded-tr-none' 
                        : 'bg-white border border-[#8b5a2b]/40 text-[#5d3c1d] rounded-tl-none'
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
              
              <div className="p-4 border-t-2 border-[#8b5a2b]/10 flex gap-2 bg-white">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Chat with Sagor..."
                  className="flex-grow bg-[#fdfcf0] border-2 border-[#8b5a2b] rounded-xl px-4 py-2 text-[10px] font-bold text-[#5d3c1d] placeholder:text-[#8b5a2b]/60 focus:outline-none"
                />
                <button onClick={handleSend} className="p-2 bg-[#90be6d] text-white rounded-xl border-2 border-[#8b5a2b] shadow-[2px_2px_0px_#8b5a2b] active:translate-y-0.5 active:shadow-none transition-all">
                  <Send size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}