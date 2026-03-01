import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function POST(req: Request) {
  try {
    const { message, riderName, progress } = await req.json();

    // Use Gemini 2.5 or 3 for the best experience in 2026
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{
        role: "user",
        parts: [{
          text: `You are ${riderName}, a friendly delivery rider for "Honey Haze" in Bangladesh.
                 Current Status: ${progress}% done. 
                 Tone: Energetic Banglish (sir, bhaiya, maam). Max 2 sentences.
                 Customer says: "${message}"`
        }]
      }]
    });

    return NextResponse.json({ text: response.text });
  } catch (error: any) {
    console.error("DEBUG:", error);
    return NextResponse.json({ text: "Sorry sir, connection lost! 🛵" }, { status: 500 });
  }
}