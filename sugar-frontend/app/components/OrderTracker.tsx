"use client";

import React, { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Phone, MessageSquare, Navigation, Timer, Banknote } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-stone-100 animate-pulse rounded-3xl" />
}) as any;
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false }) as any;
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false }) as any;
const Polyline = dynamic(() => import('react-leaflet').then(mod => mod.Polyline), { ssr: false }) as any;

const useLeaflet = () => {
  const [leaflet, setLeaflet] = useState<any>(null);
  useEffect(() => {
    import('leaflet').then((mod) => setLeaflet(mod.default));
  }, []);
  return leaflet;
};

interface OrderTrackerProps {
  address: string;
  destination: [number, number];
  onProgressUpdate?: (progress: number) => void;
}

const SHOP_COORDS: [number, number] = [23.7461, 90.3742];
const TOTAL_DURATION = 300000; // 5 minutes for realism
const NOMINAL_DELIVERY_TIME = 35;

function MapContent({ destination, currentPos, bikeIcon, shopIcon, L }: any) {
  const { useMap } = require('react-leaflet');
  const map = useMap();
  
  useEffect(() => {
    if (map && destination && L) {
      const bounds = L.latLngBounds([SHOP_COORDS, destination]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, destination, L]);

  return (
    <>
      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
      <Polyline 
        positions={[SHOP_COORDS, destination]} 
        color="#CF7486" 
        weight={3} 
        opacity={0.4} 
        dashArray="5, 10"
      />
      {shopIcon && <Marker position={SHOP_COORDS} icon={shopIcon} />}
      {bikeIcon && <Marker position={currentPos} icon={bikeIcon} />}
      {L && (
        <Marker position={destination} icon={L.divIcon({ 
            html: `<div class="text-3xl animate-bounce">📍</div>`, 
            className: 'dummy',
            iconAnchor: [15, 30]
        })} />
      )}
    </>
  );
}

export default function OrderTracker({ address, destination, onProgressUpdate }: OrderTrackerProps) {
  const L = useLeaflet(); 
  const [currentPos, setCurrentPos] = useState<[number, number]>(SHOP_COORDS);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(NOMINAL_DELIVERY_TIME);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    const startTime = Date.now();
    const moveRider = () => {
      const elapsed = Date.now() - startTime;
      const linearProgress = Math.min(elapsed / TOTAL_DURATION, 1);
      const lat = SHOP_COORDS[0] + (destination[0] - SHOP_COORDS[0]) * linearProgress;
      const lng = SHOP_COORDS[1] + (destination[1] - SHOP_COORDS[1]) * linearProgress;
      
      setCurrentPos([lat, lng]);
      setProgress(linearProgress * 100);
      if (onProgressUpdate) onProgressUpdate(linearProgress * 100);
      
      setTimeLeft(Math.ceil((1 - linearProgress) * NOMINAL_DELIVERY_TIME));
      if (linearProgress < 1) requestAnimationFrame(moveRider);
    };
    const animationFrame = requestAnimationFrame(moveRider);
    return () => cancelAnimationFrame(animationFrame);
  }, [destination, isClient, onProgressUpdate]);

  const bikeIcon = useMemo(() => {
    if (!isClient || !L) return null;
    return L.divIcon({
      className: "custom-icon",
      html: `<div style="background: white; border: 2px solid #CF7486; padding: 6px; border-radius: 50%; color: #CF7486; box-shadow: 0 4px 12px rgba(207, 116, 134, 0.4); transform: scale(1.2);">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>
             </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  }, [isClient, L]);

  const shopIcon = useMemo(() => {
    if (!isClient || !L) return null;
    return L.divIcon({
      className: "shop-icon",
      html: `<div style="background: #8b5a2b; border: 2px solid white; padding: 6px; border-radius: 12px; color: white; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/></svg>
             </div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });
  }, [isClient, L]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-[3px] border-[#8b5a2b] rounded-[2.5rem] p-4 shadow-[6px_6px_0_#8b5a2b] space-y-4 overflow-hidden"
    >
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${progress < 100 ? 'bg-[#90be6d] animate-pulse' : 'bg-blue-500'}`} />
          <span className="text-[10px] font-black text-[#8b5a2b] uppercase tracking-widest">
            {progress < 100 ? "Live Delivery Tracking" : "Order Delivered!"}
          </span>
        </div>
        <div className="flex gap-2">
            <div className="bg-[#fdfcf0] border border-[#8b5a2b]/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Timer size={10} className="text-[#8b5a2b]" />
                <span className="text-[10px] font-black text-[#8b5a2b]">{progress < 100 ? `${timeLeft}m` : '0m'}</span>
            </div>
            <div className="bg-[#FFE6ED] px-2 py-0.5 rounded-full flex items-center gap-1">
                <Banknote size={10} className="text-[#CF7486]" />
                <span className="text-[10px] font-black text-[#CF7486] uppercase">COD</span>
            </div>
        </div>
      </div>

      <div className="h-64 w-full rounded-3xl border-2 border-[#8b5a2b]/20 overflow-hidden relative z-0 shadow-inner">
        {isClient && L && (
          <MapContainer 
            key={`${destination[0]}-${destination[1]}`} 
            center={SHOP_COORDS} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <MapContent 
              destination={destination} 
              currentPos={currentPos} 
              bikeIcon={bikeIcon} 
              shopIcon={shopIcon} 
              L={L}
            />
          </MapContainer>
        )}
        
        <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-white/95 backdrop-blur-md p-3 rounded-2xl border-2 border-[#8b5a2b] flex items-center justify-between shadow-lg pointer-events-none">
          <div className="flex items-center gap-3">
             <div className="bg-[#8b5a2b] p-1.5 rounded-lg text-white">
                <Navigation size={14} className="rotate-45" />
             </div>
             <div>
                <p className="text-[8px] font-black text-[#8b5a2b]/40 uppercase leading-none">Shipping To</p>
                <p className="text-[10px] font-black text-[#8b5a2b] truncate max-w-[150px]">{address}</p>
             </div>
          </div>
          <div className="text-right">
             <p className="text-[8px] font-black text-[#90be6d] uppercase leading-none">Status</p>
             <p className="text-[10px] font-black text-[#8b5a2b]">
                {progress < 100 ? `Pay on delivery` : "Arrived"}
             </p>
          </div>
        </div>
      </div>

      <div className="pt-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#FFE6ED] rounded-2xl border-2 border-[#CF7486] flex items-center justify-center text-2xl shadow-sm">
                🛵
            </div>
            <div>
                <p className="text-[8px] font-black text-[#8b5a2b]/50 uppercase">Professional Rider</p>
                <p className="text-sm font-black text-[#8b5a2b] leading-tight">Rakib Hossain</p>
            </div>
        </div>
        <div className="flex gap-2">
            <button className="w-10 h-10 flex items-center justify-center bg-[#fdfcf0] border-2 border-[#8b5a2b] rounded-2xl text-[#8b5a2b]">
                <MessageSquare size={18} />
            </button>
            <button className="w-10 h-10 flex items-center justify-center bg-[#90be6d] border-2 border-[#8b5a2b] rounded-2xl text-white shadow-[3px_3px_0_#8b5a2b]">
                <Phone size={18} />
            </button>
        </div>
      </div>
    </motion.div>
  );
}