"use client";

import "./globals.css";
import Footer from "./components/Footer";
import SparkleTrail from "./components/SparkleTrail";
import Header from "./components/Header";
import Cart, { CartItem } from "./components/Cart";
import { Inter } from "next/font/google";
import { useState, useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [isOrdered, setIsOrdered] = useState(false);

  // 1. Load cart from localStorage and setup Sync Listener
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

    // Initial load
    syncCart();

    // Listen for changes from page.tsx or other tabs
    window.addEventListener("storage", syncCart);
    return () => window.removeEventListener("storage", syncCart);
  }, []);

  // 2. Save cart to localStorage every time it changes locally
  useEffect(() => {
    localStorage.setItem("honey_haze_cart", JSON.stringify(cart));
  }, [cart]);

  const total = cart.reduce((acc, item) => acc + (item.price || 0) * item.qty, 0);

  return (
    <html lang="en">
      <body className={`${inter.className} relative bg-[#F0EBD1]`}>
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
      </body>
    </html>
  );
}