// app/layout.tsx
import "./globals.css";
import Footer from "./components/Footer";
import SparkleTrail from "./components/SparkleTrail";
import Header from "./components/Header";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Sugar Land",
  description: "Cute vibes, chaotic energy 💖",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} relative bg-[#F0EBD1]`}>
        {/* ✨ Client components */}
        <SparkleTrail />
        <Header />

        <main className="min-h-screen">{children}</main>

        <Footer />
      </body>
    </html>
  );
}
