import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Force Next.js to evaluate this API dynamically on every request (do not cache)
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Check if the database connection is alive
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Health check failed:", error);
    return NextResponse.json(
      {
        status: "unhealthy",
        database: "disconnected",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
