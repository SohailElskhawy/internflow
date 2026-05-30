import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";



export async function POST(req: NextRequest) {
    // 1. Extract and verify token from the secure cookie
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token) as { id: string; role: string } | null;
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const userId = decoded.id;

    const body = await req.json();

    const company = await prisma.company.create({
        data: {
            userId,
            name: body.name,
            description: body.description,
        },
    });

    return NextResponse.json(company);
}