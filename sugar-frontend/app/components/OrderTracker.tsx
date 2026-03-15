"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import { motion } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Maximize } from "lucide-react";

type LatLngTuple = [number, number];
const SHOP_START: LatLngTuple = [23.8103, 90.4125];

function MapController({ route, destination }: { route: LatLngTuple[], destination: LatLngTuple }) {
  const map = useMap();
  const [hasFit, setHasFit] = useState(false);

  useEffect(() => {
    if (!destination || (destination[0] === 0 && destination[1] === 0)) return;
    if (route.length > 0 && !hasFit) {
      const points = route.length >= 2 ? route : [SHOP_START, destination];
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [70, 70], maxZoom: 16 });
      setHasFit(true); 
    }
  }, [route, map, destination, hasFit]);

  return null;
}

const getIcons = () => {
  if (typeof window === 'undefined') return { riderIcon: null, destinationIcon: null };
  return {
    riderIcon: L.divIcon({ 
      className: "custom-div-icon",
      html: `<div style="font-size: 32px; filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.3)); cursor: grab;">🛵</div>`,
      iconSize: [40, 40], iconAnchor: [20, 20] 
    }),
    destinationIcon: L.divIcon({ 
      className: "custom-div-icon",
      html: `<div style="font-size: 32px; filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.3));">📍</div>`,
      iconSize: [40, 40], iconAnchor: [20, 40] 
    })
  };
};

export default function OrderTracker({ orderId, destination, initialProgress = 0 }: { orderId: string, destination: LatLngTuple, initialProgress?: number }) {
  const [route, setRoute] = useState<LatLngTuple[]>([]);
  const [mounted, setMounted] = useState(false);
  const [mapRef, setMapRef] = useState<L.Map | null>(null);
  const { riderIcon, destinationIcon } = useMemo(() => getIcons(), []);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!destination || (destination[0] === 0 && destination[1] === 0)) return;

    const fetchRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/foot/${SHOP_START[1]},${SHOP_START[0]};${destination[1]},${destination[0]}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const json = await res.json();
        
        if (json.code === "Ok" && json.routes?.length > 0) {
          const coords = json.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as LatLngTuple);
          setRoute([...coords, destination]);
        } else {
          setRoute([SHOP_START, destination]);
        }
      } catch (e) { 
        setRoute([SHOP_START, destination]); 
      }
    };
    fetchRoute();
  }, [destination]);

  const currentPos = useMemo(() => {
    if (initialProgress <= 0 || route.length === 0) return SHOP_START;
    if (initialProgress >= 100) return destination;
    const index = Math.floor(((route.length - 1) * initialProgress) / 100);
    return route[index] || SHOP_START;
  }, [route, initialProgress, destination]);

  const splitIndex = useMemo(() => {
    if (route.length === 0) return 0;
    return Math.floor(((route.length - 1) * initialProgress) / 100);
  }, [route, initialProgress]);

  const handleRecenter = useCallback(() => {
    if (mapRef && route.length > 0) {
      const bounds = L.latLngBounds(route);
      mapRef.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [mapRef, route]);

  if (!mounted || !destination || (destination[0] === 0 && destination[1] === 0)) {
    return <div className="h-full w-full bg-[#fdfcf0] animate-pulse" />;
  }

  return (
    <div className="w-full h-full relative bg-[#fdfcf0]">
      <MapContainer 
        key={orderId} 
        center={SHOP_START} 
        zoom={15} 
        scrollWheelZoom={true} 
        dragging={true} 
        ref={setMapRef}
        style={{ height: "100%", width: "100%", cursor: 'grab' }}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
        
        <MapController route={route} destination={destination} />

        {route.length > 0 && (
          <>
            <Polyline positions={route.slice(0, splitIndex + 1)} pathOptions={{ color: '#90be6d', weight: 6, lineCap: 'round' }} />
            <Polyline positions={route.slice(splitIndex)} pathOptions={{ color: '#8b5a2b', weight: 3, dashArray: '10, 10', opacity: 0.2 }} />
          </>
        )}
        
        {riderIcon && <Marker position={currentPos} icon={riderIcon} zIndexOffset={1000} />}
        {destinationIcon && <Marker position={destination} icon={destinationIcon} />}
      </MapContainer>
      
      {/* UI Overlay - Z-index adjusted to 401 to go under the Header [1001] */}
      <div className="absolute top-4 right-4 z-[401] flex flex-col gap-2">
         <button 
            onClick={handleRecenter}
            className="bg-white p-2 border-2 border-[#8b5a2b] rounded-lg shadow-md active:scale-95 transition-transform"
            title="Recenter Map"
         >
            <Maximize size={18} className="text-[#8b5a2b]" />
         </button>
      </div>

      <div className="absolute bottom-4 left-4 right-4 z-[401] bg-white p-3 border-2 border-[#8b5a2b] rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[10px] font-black uppercase text-[#1a120b]">Live Progress</span>
          <span className="text-[10px] font-black uppercase text-[#90be6d]">
            {initialProgress <= 0 ? "Packing..." : initialProgress >= 100 ? "Arrived" : `${Math.round(initialProgress)}%`}
          </span>
        </div>
        <div className="h-2 w-full bg-[#8b5a2b]/10 rounded-full overflow-hidden border border-[#8b5a2b]/5">
          <motion.div 
            className="h-full bg-[#90be6d]" 
            initial={{ width: 0 }}
            animate={{ width: `${initialProgress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
}