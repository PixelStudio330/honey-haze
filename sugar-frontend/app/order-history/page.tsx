"use client";

import { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, History, CheckCircle2, Bike, 
  Map as MapIcon, Trash2, X, Package, Check 
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { toast, Toaster } from "react-hot-toast";
import RiderChat from "../components/RiderChat";
import MemoReceipt from "../components/MemoReceipt";
import RiderReview from "../components/RiderReview";
import { TipJar } from "../components/TipJar"; 

const OrderTracker = dynamic(() => import("../components/OrderTracker"), { 
  ssr: false,
  loading: () => <div className="h-[350px] w-full bg-[#fdfcf0] animate-pulse flex items-center justify-center text-[10px] font-black uppercase text-[#8b5a2b]">Initializing Radar...</div>
});

const MapWrapper = memo(({ orderId, destination, progress }: { orderId: string, destination: [number, number], progress: number }) => (
  <div id={`map-holder-${orderId}`} className="h-[350px] w-full relative">
    <OrderTracker 
      orderId={orderId} 
      destination={destination} 
      initialProgress={progress} 
    />
  </div>
));
MapWrapper.displayName = "MapWrapper";

const JU_HALLS: Record<string, [number, number]> = {
  "kazi nazrul": [23.8821, 90.2673],
  "nazrul islam": [23.8821, 90.2673],
  "al beruni": [23.8790, 90.2720],
  "fazilatunnesa": [23.8835, 90.2685],
  "jahangirnagar": [23.8824, 90.2671]
};

interface Order {
  id: string;
  items: any[];
  total: number;
  customerName: string;
  phoneNumber: string;
  address: string;
  coords: [number, number];
  startTime: number;
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [now, setNow] = useState(Date.now());
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});
  const [acceptedOrders, setAcceptedOrders] = useState<Record<string, boolean>>({});

  const defaultAvatars = [
    "/images/avatars/sakura.jpg",
    "/images/avatars/cupcake.jpg",
    "/images/avatars/pancake.jpg",
    "/images/avatars/coffee.jpg",
    "/images/avatars/cake.jpg"
  ];

  useEffect(() => {
    const savedOrders = localStorage.getItem("honey_haze_orders");
    const savedAccepted = localStorage.getItem("honey_haze_accepted");
    
    if (savedOrders) {
      const parsed = JSON.parse(savedOrders);
      setOrders(parsed);
      const initialState: Record<string, boolean> = {};
      parsed.forEach((o: Order) => {
        initialState[o.id] = true; 
      });
      setExpandedMap(initialState);
    }

    if (savedAccepted) {
      setAcceptedOrders(JSON.parse(savedAccepted));
    }

    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const calculateProgress = (startTime: number) => {
    const packingDuration = 20000; 
    const deliveryDuration = 40000; 
    const elapsed = now - startTime;
    if (elapsed < packingDuration) return 0;
    const drivingElapsed = elapsed - packingDuration;
    const progress = (drivingElapsed / deliveryDuration) * 100;
    return Math.min(progress, 100);
  };

  const getStatus = (startTime: number, progress: number, id: string) => {
    if (acceptedOrders[id]) return { text: "Order Finalized", color: "text-[#90be6d]", icon: <CheckCircle2 size={14} /> };
    if (progress >= 100) return { text: "Successfully Delivered", color: "text-[#90be6d]", icon: <CheckCircle2 size={14} /> };
    const elapsed = now - startTime;
    if (elapsed < 20000) return { text: "Packing...", color: "text-amber-500", icon: <Package size={14} className="animate-pulse" /> };
    return { text: "Incoming...", color: "text-orange-500", icon: <Bike size={14} className="animate-bounce" /> };
  };

  const handleSaveReview = (reviewData: any, order: Order, riderId: string) => {
    const existingReviews = JSON.parse(localStorage.getItem("honey_haze_public_reviews") || "[]");
    
    const randomAvatar = defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];
    
    const newReview = {
      id: Date.now(),
      name: order.customerName || "Valued Customer",
      comment: reviewData.comment || "No comment provided.",
      rating: reviewData.rating || 5,
      avatar: randomAvatar,
      orderId: order.id,
      riderId: riderId,
      timestamp: Date.now(),
      items: order.items.map(i => i.name)
    };

    const updatedReviews = [newReview, ...existingReviews];
    localStorage.setItem("honey_haze_public_reviews", JSON.stringify(updatedReviews));
    
    toast.success("Added To The Review Archive!", {
      style: {
        border: '3px solid #8b5a2b',
        padding: '16px',
        color: '#8b5a2b',
        fontWeight: '900',
        textTransform: 'uppercase',
        fontSize: '12px',
        borderRadius: '20px',
        background: '#FFE6ED',
      },
      iconTheme: {
        primary: '#8b5a2b',
        secondary: '#fff',
      },
    });
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
    if (window.confirm("Delete all finished histories?")) {
      const remainingOrders = orders.filter(o => calculateProgress(o.startTime) < 100 && !acceptedOrders[o.id]);
      setOrders(remainingOrders);
      localStorage.setItem("honey_haze_orders", JSON.stringify(remainingOrders));
    }
  };

  return (
    <div className="min-h-screen bg-[#fffdf5] pb-20">
      <Toaster position="bottom-center" />
      <header className="sticky top-0 z-[9999] bg-[#FFE6ED] border-b-[3px] border-[#8b5a2b] p-6 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 bg-white rounded-full border-2 border-[#8b5a2b] shadow-[2px_2px_0_#8b5a2b]">
              <ArrowLeft size={20} className="text-[#8b5a2b]" />
            </Link>
            <h1 className="text-2xl font-black text-[#8b5a2b] uppercase tracking-tighter">My Orders</h1>
          </div>
          {orders.length > 0 && (
            <button onClick={wipeCompletedOrders} className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#8b5a2b] rounded-xl text-[10px] font-black text-[#8b5a2b] uppercase shadow-[3px_3px_0_#8b5a2b]">
              <Trash2 size={14} /> Wipe All
            </button>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-16 [isolation:isolate]">
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
              const isMapOpen = expandedMap[order.id] ?? true;

              let resolvedDestination = order.coords;
              const addr = order.address.toLowerCase();
              Object.keys(JU_HALLS).forEach(hall => {
                if (addr.includes(hall)) resolvedDestination = JU_HALLS[hall];
              });

              return (
                <motion.section key={order.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, x: -100 }} className="relative">
                  <div className="flex justify-between items-center mb-4 px-2">
                    <div className={`text-[10px] font-black uppercase flex items-center gap-1.5 ${status.color}`}>
                      {status.icon} {status.text}
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="text-[9px] font-black text-[#8b5a2b]/40 uppercase">Progress: {Math.round(progress)}%</span>
                       <button onClick={() => deleteIndividualOrder(order.id, progress)} className="p-1.5 bg-[#FFE6ED] border-2 border-[#8b5a2b] rounded-lg text-[#8b5a2b] hover:bg-red-100 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-[2.5rem] shadow-[12px_12px_0_rgba(139,90,43,0.1)] overflow-hidden border-[3px] border-[#8b5a2b]">
                    {!isAccepted && (
                      <div className="relative bg-[#fdfcf0]">
                        <div className="absolute bottom-4 right-4 z-[501] flex flex-col gap-2 items-end">
                           <button 
                            onClick={() => toggleMap(order.id)} 
                            className="bg-white border-2 border-[#8b5a2b] px-3 py-2 rounded-2xl flex items-center gap-2 shadow-[3px_3px_0_#8b5a2b] active:translate-y-0.5 active:shadow-none transition-all group"
                          >
                            <MapIcon size={16} className={`text-[#8b5a2b] ${isMapOpen ? 'fill-[#8b5a2b]/10' : ''}`} />
                            <span className="text-[10px] font-black uppercase text-[#8b5a2b]">
                              {isMapOpen ? "Minimize" : "Live Radar"}
                            </span>
                          </button>
                        </div>

                        <AnimatePresence initial={false}>
                          {isMapOpen && (
                            <motion.div 
                              key={`map-container-${order.id}`}
                              initial={{ height: 0 }} 
                              animate={{ height: 350 }} 
                              exit={{ height: 0 }} 
                              className="w-full overflow-hidden relative z-0 border-b-[3px] border-[#8b5a2b]"
                            >
                              <MapWrapper 
                                orderId={order.id}
                                destination={resolvedDestination}
                                progress={progress}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                        
                        {!isMapOpen && <div className="h-14 w-full" />}
                      </div>
                    )}

                    <div className="p-0 relative">
                      <MemoReceipt 
                        orderId={order.id} 
                        items={order.items} 
                        total={order.total} 
                        date={order.startTime} 
                        customerName={order.customerName} 
                        phoneNumber={order.phoneNumber} 
                        address={order.address}
                        isAccepted={isAccepted}
                        progress={progress}
                      />
                      
                      {progress >= 100 && !isAccepted && (
                        <div className="p-6 bg-[#fdfcf0] border-t-[3px] border-[#8b5a2b] space-y-6">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="bg-white p-4 rounded-3xl border-2 border-[#8b5a2b]/10 shadow-sm">
                               <RiderReview 
                                 riderName="Rider #204" 
                                 onSave={(data) => handleSaveReview(data, order, "rider_204")} 
                               />
                             </div>
                             <div className="bg-white p-4 rounded-3xl border-2 border-[#8b5a2b]/10 shadow-sm">
                               <TipJar />
                             </div>
                           </div>
                           
                           <button 
                            onClick={() => handleAcceptOrder(order.id)}
                            className="w-full bg-[#90be6d] text-white border-[3px] border-[#8b5a2b] py-4 rounded-2xl font-black uppercase text-sm shadow-[4px_4px_0_#8b5a2b] hover:scale-[1.01] active:translate-y-1 transition-all flex items-center justify-center gap-3 group"
                           >
                            <Check size={20} strokeWidth={4} /> Finalize & Archive Order
                           </button>
                        </div>
                      )}
                    </div>

                    <div className={`p-6 bg-[#fffdf5] border-t-[3px] border-[#8b5a2b] transition-all duration-500 ${isAccepted ? 'opacity-40 pointer-events-none grayscale brightness-95' : 'opacity-100'}`}>
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