"use client";

import "./globals.css";
import Footer from "./components/Footer";
import SparkleTrail from "./components/SparkleTrail";
import Header from "./components/Header";
import Cart, { CartItem } from "./components/Cart";
import { Inter } from "next/font/google";
import { useState, useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import Lenis from "@studio-freight/lenis"; // 1. Import Lenis

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [isOrdered, setIsOrdered] = useState(false);

  // --- Lenis Smooth Scroll Implementation ---
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom easing for that "Mac" feel
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  // --- Cart Sync Logic ---
  useEffect(() => {
    const syncCart = () => {
      const savedCart = localStorage.getItem("honey_haze_cart");
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (e) {
          console.error("Failed to parse cart", e);
        }
      } else {
        setCart([]);
      }
    };
    syncCart();
    window.addEventListener("storage", syncCart);
    return () => window.removeEventListener("storage", syncCart);
  }, []);

  useEffect(() => {
    localStorage.setItem("honey_haze_cart", JSON.stringify(cart));
  }, [cart]);

  const total = cart.reduce((acc, item) => acc + (item.price || 0) * item.qty, 0);

  return (
    <html lang="en">
      <body className={`${inter.className} relative bg-[#F0EBD1] antialiased`}>
        <SessionProvider>
          <SparkleTrail />
          <Header />

          <main className="min-h-screen pt-24">{children}</main>

          <Cart 
            cart={cart} 
            setCart={setCart} 
            cartOpen={cartOpen} 
            setCartOpen={setCartOpen} 
            total={total}
            isOrdered={isOrdered}
            setIsOrdered={setIsOrdered}
          />

          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}