import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// get student profile
export async function GET(req: NextRequest) {
    // 1. Extract and verify token from the secure cookie
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token) as { id: string; role: string } | null;
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const userId = decoded.id;

    // 2. Fetch the profile securely
    const profile = await prisma.studentProfile.findUnique({
        where: { userId: userId },
    });
    
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    return NextResponse.json(profile);
}

// update or create student profile
export async function POST(req: NextRequest) {
    // 1. Validate auth token from cookie securely (do NOT trust the client to send userId)
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token) as { id: string; role: string } | null;
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const userId = decoded.id;

    // 2. Extract updatable profile fields from the body
    const { university, major, skills, cvUrl } = await req.json();

    const profile = await prisma.studentProfile.upsert({
        where: { userId },
        update: { university, major, skills, cvUrl },
        create: { userId, university, major, skills, cvUrl },
    });
    
    return NextResponse.json(profile);
}