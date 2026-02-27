import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// This prevents creating a new connection every time you refresh in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

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