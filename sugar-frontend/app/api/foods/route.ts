import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; 

export async function GET() {
  try {
    // This talks to Neon and gets your 16 food items
    const foods = await prisma.food.findMany();
    
    return NextResponse.json(foods);
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: "Failed to fetch foods" }, { status: 500 });
  }
}