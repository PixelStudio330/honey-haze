import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

// Trim the key to prevent hidden newline/space errors from .env
const apiKey = (process.env.GEMINI_API_KEY || "").trim();
const ai = new GoogleGenAI({ apiKey });

export async function POST(req: Request) {
  try {
    const { message, riderName, progress } = await req.json();

    // Verification: Ensure we don't send an empty prompt
    if (!message) {
      return NextResponse.json({ text: "Sir, apnar message ta bujhte parini. Bolun?" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{
        role: "user",
        parts: [{
          text: `You are ${riderName}, a friendly delivery rider for "Honey Haze" in Bangladesh.
          Never use any violent word, always be respectful towards the customer and use Banglish (Bengali-English mix) in an energetic tone.
          If the customer asks about the amount they have to pay just say "Order on the way, sir! Just keep the cash ready. Currently driving so it's hard to take out the receipt, I am so sorry."
          Current Status: ${progress}% done. 
          Tone: Energetic Banglish (sir, ma'am). Max 2 sentences.
          Customer says: "${message}"`
        }]
      }]
    });

    // Ensure we handle the text extraction based on your package's specific return type
    const responseText = response?.text || "Sir, ektu traffic e achi, ashtesi! 🛵";

    return NextResponse.json({ text: responseText });

  } catch (error: any) {
    console.error("DEBUG:", error);
    
    // Fallback: This prevents the "Lost Connection" UI error by returning a 200 with a manual message
    // If the 404 persists, Sagor will use these lines instead of crashing.
    const fallbacks = [
      "Sir, rastay khub jam! I am coming as fast as I can! 🛵",
      "Almost there sir! Just turning the corner. 🍯",
      "Network ektu problem kortese sir, but don't worry, treats are safe!"
    ];
    const randomFallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];

    return NextResponse.json({ text: randomFallback });
  }
}