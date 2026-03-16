"use client";

import "./globals.css";
import Footer from "./components/Footer";
import SparkleTrail from "./components/SparkleTrail";
import Header from "./components/Header";
import Cart, { CartItem } from "./components/Cart";
import { Inter } from "next/font/google";
import { useState, useEffect } from "react";
import { SessionProvider } from "next-auth/react"; // Added this

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [isOrdered, setIsOrdered] = useState(false);

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
      <body className={`${inter.className} relative bg-[#F0EBD1]`}>
        <SessionProvider> {/* Wrapped entire body */}
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