"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Phone, MessageSquare, User, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  progress: number;
  deliveryTime: string;
}

export default function RiderChat({ progress, deliveryTime }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{role: 'rider' | 'user', text: string}[]>([
    { role: 'rider', text: "Hey! I've picked up your treats. On my way! 🍩" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const res = await fetch("/api/rider-chat", {
        method: "POST",
        body: JSON.stringify({ message: userMsg, riderName: "Sagor", progress }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'rider', text: data.text }]);
    } catch {
      setMessages(prev => [...prev, { role: 'rider', text: "Signal is weak in this alley! 🛵" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-white border-2 border-[#8b5a2b] rounded-2xl shadow-[4px_4px_0px_#8b5a2b] overflow-hidden">
      {/* Rider Info Header */}
      <div className="p-4 flex items-center justify-between border-b-2 border-[#8b5a2b]/10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-[#FFE6ED] rounded-full border-2 border-[#8b5a2b] flex items-center justify-center overflow-hidden">
             <User className="text-[#8b5a2b]" size={20} />
          </div>
          <div>
            <h4 className="text-xs font-black text-[#8b5a2b] uppercase">Sagor (Rider)</h4>
            <p className="text-[10px] font-bold text-[#90be6d] flex items-center gap-1">
              <span className="animate-pulse">●</span> {progress < 100 ? 'On the way' : 'Arrived'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 bg-[#fdfcf0] border-2 border-[#8b5a2b] rounded-xl text-[#8b5a2b] hover:bg-[#FFE6ED] transition-colors">
            <Phone size={16} />
          </button>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 border-2 border-[#8b5a2b] rounded-xl transition-all ${isOpen ? 'bg-[#8b5a2b] text-white' : 'bg-[#fdfcf0] text-[#8b5a2b]'}`}
          >
            <MessageSquare size={16} />
          </button>
        </div>
      </div>

      {/* Collapsible Chat UI */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0 }} animate={{ height: 300 }} exit={{ height: 0 }}
            className="flex flex-col bg-[#fdfcf0]"
          >
            <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-2 rounded-xl text-[10px] font-bold shadow-sm ${
                    m.role === 'user' ? 'bg-[#8b5a2b] text-white rounded-tr-none' : 'bg-white border border-[#8b5a2b]/20 text-[#8b5a2b] rounded-tl-none'
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
            
            <div className="p-3 border-t-2 border-[#8b5a2b]/10 flex gap-2">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask your rider..."
                className="flex-grow bg-white border-2 border-[#8b5a2b] rounded-lg px-3 py-1 text-[10px] font-bold focus:outline-none"
              />
              <button onClick={handleSend} className="p-2 bg-[#90be6d] text-white rounded-lg border-2 border-[#8b5a2b]">
                <Send size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}