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
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [route, map]);
  return null;
}

const riderIcon = typeof window !== 'undefined' ? L.divIcon({ 
  className: "custom-div-icon",
  html: `<div style="font-size: 28px; filter: drop-shadow(2px 2px 0px white);">🛵</div>`,
  iconSize: [30, 30], iconAnchor: [15, 15] 
}) : null;

const destinationIcon = typeof window !== 'undefined' ? L.divIcon({ 
  className: "custom-div-icon",
  html: `<div style="font-size: 28px; filter: drop-shadow(2px 2px 0px white);">📍</div>`,
  iconSize: [30, 30], iconAnchor: [15, 30] 
}) : null;

export default function OrderTracker({ orderId, destination, initialProgress = 0 }: { orderId: string, destination: LatLngTuple, initialProgress?: number }) {
  const [route, setRoute] = useState<LatLngTuple[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!destination) return;
    const fetchRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${SHOP_START[1]},${SHOP_START[0]};${destination[1]},${destination[0]}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const json = await res.json();
        
        if (json.code === "Ok" && json.routes?.length > 0) {
          const coords = json.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as LatLngTuple);
          setRoute(coords);
        } else {
          // Fallback for university campuses/interior areas
          setRoute([SHOP_START, destination]);
        }
      } catch (e) { 
        setRoute([SHOP_START, destination]); 
      }
    };
    fetchRoute();
  }, [destination]);

  const splitIndex = useMemo(() => {
    if (initialProgress <= 0 || route.length === 0) return 0;
    return Math.floor(((route.length - 1) * initialProgress) / 100);
  }, [route, initialProgress]);
  
  const currentPos = route[splitIndex] || SHOP_START;

  if (!mounted || !destination) return null;

  return (
    <div className="w-full h-full relative bg-[#fdfcf0]">
      <MapContainer key={orderId} center={SHOP_START} zoom={15} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
        {route.length > 0 && (
          <>
            <MapController route={route} />
            <Polyline positions={route.slice(0, splitIndex + 1)} pathOptions={{ color: '#90be6d', weight: 5 }} />
            <Polyline positions={route.slice(splitIndex)} pathOptions={{ color: '#8b5a2b', weight: 2, dashArray: '5, 10', opacity: 0.3 }} />
          </>
        )}
        {riderIcon && <Marker position={currentPos} icon={riderIcon} />}
        {destinationIcon && <Marker position={destination} icon={destinationIcon} />}
      </MapContainer>
      
      <div className="absolute bottom-4 left-4 right-4 z-[500] bg-white p-3 border-2 border-[#8b5a2b] rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[10px] font-black uppercase text-[#1a120b]">Live Progress</span>
          <span className="text-[10px] font-black uppercase text-[#90be6d]">
            {initialProgress <= 0 ? "Packing..." : `${Math.round(initialProgress)}%`}
          </span>
        </div>
        <div className="h-2 w-full bg-[#8b5a2b]/10 rounded-full overflow-hidden border border-[#8b5a2b]/5">
          <div className="h-full bg-[#90be6d] transition-all duration-1000 ease-linear" style={{ width: `${initialProgress}%` }} />
        </div>
      </div>
    </div>
  );
}