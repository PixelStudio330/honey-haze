"use client";

import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type LatLngTuple = [number, number];
const SHOP_START: LatLngTuple = [23.8103, 90.4125];

function MapController({ route }: { route: LatLngTuple[] }) {
  const map = useMap();
  useEffect(() => {
    if (route && route.length >= 2) {
      const bounds = L.latLngBounds(route);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [route, map]);
  return null;
}

// RIDER ICON
const riderIcon = typeof window !== 'undefined' ? L.icon({ 
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2972/2972185.png", 
  iconSize: [35, 35], 
  iconAnchor: [17, 35] 
}) : null;

// DESTINATION ICON
const destinationIcon = typeof window !== 'undefined' ? L.icon({ 
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", 
  iconSize: [30, 30], 
  iconAnchor: [15, 30] 
}) : null;

// CAFE ICON (Honeypot Emoji 🍯)
const cafeEmojiIcon = typeof window !== 'undefined' ? L.divIcon({
  html: `<div style="font-size: 24px; filter: drop-shadow(2px 2px 0px rgba(0,0,0,0.1));">🍯</div>`,
  className: "custom-div-icon", 
  iconSize: [30, 30],
  iconAnchor: [15, 25]
}) : null;

interface OrderTrackerProps {
  address?: string;
  destination: LatLngTuple;
  onProgressUpdate?: (progress: number) => void;
  initialProgress?: number;
}

export default function OrderTracker({ 
  address, 
  destination, 
  onProgressUpdate, 
  initialProgress = 0 
}: OrderTrackerProps) {
  const [route, setRoute] = useState<LatLngTuple[]>([]);
  const [progress, setProgress] = useState(initialProgress);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Sync with initialProgress from localStorage/Parent
  useEffect(() => {
    if (initialProgress > progress) {
      setProgress(initialProgress);
    }
  }, [initialProgress]);

  // Fetch Route from OSRM
  useEffect(() => {
    if (!destination || destination[0] === 0) return;
    
    const getRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${SHOP_START[1]},${SHOP_START[0]};${destination[1]},${destination[0]}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const json = await res.json();
        
        if (json.code === "Ok" && json.routes?.[0]) {
          const coords = json.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]] as LatLngTuple);
          setRoute(coords);
        } else {
          setRoute([SHOP_START, destination]);
        }
      } catch (e) {
        setRoute([SHOP_START, destination]);
      }
    };
    getRoute();
  }, [destination]);

  // --- MEDIUM SPEED MOVEMENT ---
  useEffect(() => {
    if (route.length < 2 || progress >= 100) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        // 0.2 increment = ~50 seconds total delivery time
        const next = prev + 0.2; 
        return next >= 100 ? 100 : next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [route, progress]);

  // Calculate current rider index on the route
  const splitIndex = useMemo(() => {
    if (route.length === 0) return 0;
    return Math.min(Math.floor((route.length - 1) * (progress / 100)), route.length - 1);
  }, [route, progress]);

  // Current GPS Coordinate for Rider
  const currentPos = useMemo(() => {
    if (route.length === 0) return SHOP_START;
    return route[splitIndex] || SHOP_START;
  }, [route, splitIndex]);

  // Notify parent of progress
  useEffect(() => {
    if (onProgressUpdate) onProgressUpdate(Math.floor(progress));
  }, [progress, onProgressUpdate]);

  if (!mounted || !destination) return null;

  return (
    <div className="space-y-4 mb-6">
      <div className="w-full h-[250px] rounded-2xl overflow-hidden border-2 border-[#8b5a2b] shadow-[4px_4px_0px_#8b5a2b] relative z-0">
        <MapContainer center={SHOP_START} zoom={15} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
          
          {route.length > 0 && (
            <>
              <MapController route={route} />
              
              {/* THE REMAINING PATH (Dashed) */}
              <Polyline 
                positions={route.slice(splitIndex)} 
                pathOptions={{ 
                  color: '#8b5a2b', 
                  weight: 3, 
                  dashArray: '5, 10', 
                  opacity: 0.4 
                }} 
              />
              
              {/* THE COMPLETED PATH (Solid Green) */}
              <Polyline 
                positions={route.slice(0, splitIndex + 1)} 
                pathOptions={{ 
                  color: '#90be6d', 
                  weight: 5,
                  lineCap: 'round',
                  lineJoin: 'round'
                }} 
              />
            </>
          )}

          {/* Markers */}
          {cafeEmojiIcon && <Marker position={SHOP_START} icon={cafeEmojiIcon} />}
          {riderIcon && <Marker position={currentPos} icon={riderIcon} />}
          {destinationIcon && <Marker position={destination} icon={destinationIcon} />}
        </MapContainer>
      </div>

      {/* Progress Card */}
      <div className="bg-white border-2 border-[#8b5a2b] p-4 rounded-2xl shadow-[4px_4px_0px_rgba(139,90,43,0.1)]">
        <div className="flex justify-between items-end mb-2">
          <div className="flex flex-col">
             <span className="text-[10px] font-black text-[#8b5a2b] uppercase tracking-widest">Live Tracking</span>
             <span className="text-[9px] font-bold text-[#8b5a2b]/60">Sagor is picking up speed...</span>
          </div>
          <span className="text-sm font-black text-[#D4A24C]">{Math.floor(progress)}%</span>
        </div>
        
        <div className="h-3 w-full bg-[#fdfcf0] border-2 border-[#8b5a2b] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#90be6d] transition-all duration-300" 
            style={{ 
              width: `${progress}%`,
              transitionTimingFunction: 'linear'
            }}
          />
        </div>
      </div>
    </div>
  );
}