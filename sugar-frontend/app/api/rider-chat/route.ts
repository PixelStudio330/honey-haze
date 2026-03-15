import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Ensure you've updated your .env.local with the NEW key!
const apiKey = (process.env.GEMINI_API_KEY || "").trim();
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  try {
    const { message, riderName, progress } = await req.json();

    if (!message) {
      return NextResponse.json({ text: "Sir, message ta asheni. Abar bolben?" });
    }

    // Try 'gemini-1.5-flash' first. 
    // If it still 404s, change this string to 'gemini-2.0-flash'
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are ${riderName}, a friendly delivery rider for "Honey Haze" in Bangladesh.
      Be respectful and use energetic Banglish. 
      If asked about payment: "Order on the way, sir! Cash ready raikhen. Currently driving so receipt ber kora kothin, sorry sir."
      Current Status: ${progress}% done. 
      Tone: Energetic Banglish. Max 2 sentences.
      Customer says: "${message}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text() || "Sir, ektu traffic e achi, ashtesi! 🛵";

    return NextResponse.json({ text: responseText });

  } catch (error: any) {
    console.error("DEBUG ERROR:", error);
    
    const fallbacks = [
      "Sir, rastay khub jam! I am coming as fast as I can! 🛵",
      "Almost there sir! Just turning the corner. 🍯",
      "Network ektu problem kortese sir, treats are safe!"
    ];
    const randomFallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    return NextResponse.json({ text: randomFallback });
  }
}