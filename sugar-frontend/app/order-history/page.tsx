"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, History, CheckCircle2, Bike, 
  Map as MapIcon, Trash2, X, Package, Check 
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import RiderChat from "../components/RiderChat";
import MemoReceipt from "../components/MemoReceipt";

const OrderTracker = dynamic(() => import("../components/OrderTracker"), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-[#fdfcf0] animate-pulse flex items-center justify-center text-[10px] font-black uppercase text-[#8b5a2b]">Loading Radar...</div>
});

interface Order {
  id: string;
  items: any[];
  total: number;
  customerName: string; // Added to match Cart's newOrder
  phoneNumber: string;   // Added to match Cart's newOrder
  address: string;
  coords: [number, number];
  startTime: number;
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [now, setNow] = useState(Date.now());
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});
  const [acceptedOrders, setAcceptedOrders] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const savedOrders = localStorage.getItem("honey_haze_orders");
    const savedAccepted = localStorage.getItem("honey_haze_accepted");
    
    if (savedOrders) {
      const parsed = JSON.parse(savedOrders);
      setOrders(parsed);
      const initialState: Record<string, boolean> = {};
      parsed.forEach((o: Order) => initialState[o.id] = true);
      setExpandedMap(initialState);
    }

    if (savedAccepted) {
      setAcceptedOrders(JSON.parse(savedAccepted));
    }

    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const calculateProgress = (startTime: number) => {
    const delayMs = 120000; // 2 minute packing delay
    const elapsedMs = now - startTime;
    if (elapsedMs < delayMs) return 0;
    
    const drivingMs = elapsedMs - delayMs;
    // 100% divided by 40 seconds = 2.5% per second
    const progress = (drivingMs / 1000) * 2.5; 
    return Math.min(progress, 100);
  };

  const getStatus = (startTime: number, progress: number, id: string) => {
    if (acceptedOrders[id]) return { text: "Order Finalized", color: "text-[#90be6d]", icon: <CheckCircle2 size={14} /> };
    if (progress >= 100) return { text: "Successfully Delivered", color: "text-[#90be6d]", icon: <CheckCircle2 size={14} /> };
    
    const elapsedMs = now - startTime;
    if (elapsedMs < 120000) {
      return { text: "Packing your order...", color: "text-amber-500", icon: <Package size={14} className="animate-pulse" /> };
    }
    return { text: "Delivery Incoming...", color: "text-orange-500", icon: <Bike size={14} className="animate-bounce" /> };
  };

  const handleAcceptOrder = (id: string) => {
    const newAccepted = { ...acceptedOrders, [id]: true };
    setAcceptedOrders(newAccepted);
    localStorage.setItem("honey_haze_accepted", JSON.stringify(newAccepted));
  };

  const toggleMap = (id: string) => {
    setExpandedMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const deleteIndividualOrder = (id: string, progress: number) => {
    if (progress < 100 && !acceptedOrders[id]) {
      alert("Delivery still processing!");
      return;
    }
    if (window.confirm("Delete this order history?")) {
      const updatedOrders = orders.filter(o => o.id !== id);
      setOrders(updatedOrders);
      localStorage.setItem("honey_haze_orders", JSON.stringify(updatedOrders));
      
      const newAccepted = { ...acceptedOrders };
      delete newAccepted[id];
      setAcceptedOrders(newAccepted);
      localStorage.setItem("honey_haze_accepted", JSON.stringify(newAccepted));
    }
  };

  const wipeCompletedOrders = () => {
    const hasComplete = orders.some(o => calculateProgress(o.startTime) >= 100 || acceptedOrders[o.id]);
    if (!hasComplete) {
      alert("No completed orders to delete!");
      return;
    }
    if (window.confirm("Delete all finished histories?")) {
      const remainingOrders = orders.filter(o => calculateProgress(o.startTime) < 100 && !acceptedOrders[o.id]);
      setOrders(remainingOrders);
      localStorage.setItem("honey_haze_orders", JSON.stringify(remainingOrders));
    }
  };

  return (
    <div className="min-h-screen bg-[#fffdf5] pb-20">
      <header className="sticky top-0 z-50 bg-[#FFE6ED] border-b-[3px] border-[#8b5a2b] p-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 bg-white rounded-full border-2 border-[#8b5a2b] shadow-[2px_2px_0_#8b5a2b]">
              <ArrowLeft size={20} className="text-[#8b5a2b]" />
            </Link>
            <h1 className="text-2xl font-black text-[#8b5a2b] uppercase tracking-tighter">My Orders</h1>
          </div>
          {orders.length > 0 && (
            <button onClick={wipeCompletedOrders} className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#8b5a2b] rounded-xl text-[10px] font-black text-[#8b5a2b] uppercase shadow-[3px_3px_0_#8b5a2b] active:translate-y-0.5 hover:bg-red-50 transition-all">
              <Trash2 size={14} /> Wipe All
            </button>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-16">
        {orders.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <History size={48} className="text-[#8b5a2b]/20 mx-auto" />
            <p className="font-bold text-[#8b5a2b]/40 uppercase text-xs tracking-widest">No orders found</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {orders.map((order) => {
              const progress = calculateProgress(order.startTime);
              const isAccepted = acceptedOrders[order.id];
              const status = getStatus(order.startTime, progress, order.id);
              const isMapOpen = expandedMap[order.id];

              return (
                <motion.section key={order.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, x: -100 }} className="relative">
                  <div className="flex justify-between items-center mb-4 px-2">
                    <div className={`text-[10px] font-black uppercase flex items-center gap-1.5 ${status.color}`}>
                      {status.icon}
                      {status.text}
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="text-[9px] font-black text-[#8b5a2b]/40 uppercase">Progress: {Math.round(progress)}%</span>
                       <button onClick={() => deleteIndividualOrder(order.id, progress)} className="p-1.5 bg-[#FFE6ED] border-2 border-[#8b5a2b] rounded-lg text-[#8b5a2b] hover:bg-red-100 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-[2.5rem] shadow-[12px_12px_0_rgba(139,90,43,0.1)] overflow-hidden border-[3px] border-[#8b5a2b]">
                    <div className="relative border-b-[3px] border-[#8b5a2b] bg-[#fdfcf0]">
                      <AnimatePresence initial={false}>
                        {isMapOpen && (
                          <motion.div initial={{ height: 0 }} animate={{ height: 300 }} exit={{ height: 0 }} className="w-full overflow-hidden">
                            <OrderTracker 
                              key={`map-${order.id}`} 
                              orderId={order.id} 
                              destination={order.coords} 
                              initialProgress={progress} 
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <button onClick={() => toggleMap(order.id)} className="absolute bottom-4 right-4 z-30 bg-white border-2 border-[#8b5a2b] px-3 py-1.5 rounded-full flex items-center gap-2 shadow-[2px_2px_0_#8b5a2b] active:translate-y-0.5">
                        <MapIcon size={14} className="text-[#8b5a2b]" />
                        <span className="text-[9px] font-black uppercase text-[#8b5a2b]">
                          {isMapOpen ? "Hide Map" : "Live Track"}
                        </span>
                      </button>
                    </div>

                    <div className="p-0 relative">
                      {/* Mapping the new props here so MemoReceipt displays customer details */}
                      <MemoReceipt 
                        orderId={order.id} 
                        items={order.items} 
                        total={order.total} 
                        date={order.startTime} 
                        customerName={order.customerName}
                        phoneNumber={order.phoneNumber}
                        address={order.address}
                      />
                      
                      {progress >= 100 && !isAccepted && (
                        <div className="absolute inset-0 z-40 bg-white/40 backdrop-blur-[2px] flex items-center justify-center p-6">
                           <button 
                            onClick={() => handleAcceptOrder(order.id)}
                            className="bg-[#90be6d] text-white border-[3px] border-[#8b5a2b] px-8 py-4 rounded-2xl font-black uppercase text-sm shadow-[4px_4px_0_#8b5a2b] hover:scale-105 active:translate-y-1 transition-all flex items-center gap-3 group"
                           >
                            <Check size={20} strokeWidth={4} className="group-hover:scale-110" /> Accept Order
                           </button>
                        </div>
                      )}
                    </div>

                    <div className={`p-6 bg-[#fffdf5] border-t-[3px] border-[#8b5a2b] transition-all duration-500 ${isAccepted ? 'opacity-40 pointer-events-none grayscale brightness-90' : 'opacity-100'}`}>
                      <RiderChat 
                        orderId={order.id} 
                        progress={progress} 
                        deliveryTime={progress <= 0 ? "Packing..." : "Incoming"} 
                      />
                    </div>
                  </div>
                </motion.section>
              );
            })}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}