import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded = verifyToken(token) as { id: string; role: string } | null;
        if (!decoded || decoded.role !== "COMPANY") {
            return NextResponse.json({ error: "Forbidden: Company access required" }, { status: 403 });
        }

        const userId = decoded.id;

        const body = await req.json();
        const { name, description } = body;

        if (!name || !description) {
            return NextResponse.json({ error: "Name and description are required" }, { status: 400 });
        }

        const company = await prisma.company.create({
            data: {
                userId,
                name,
                description,
            },
        });

        return NextResponse.json(company, { status: 201 });
    } catch (error) {
        console.error("POST /api/companies error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}