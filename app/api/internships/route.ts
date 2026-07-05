import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { getCompanyByUserId } from "@/lib/services/company.service";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = verifyToken(token) as { id: string; role: string } | null;
        if (!decoded || decoded.role !== "COMPANY") {
            return NextResponse.json({ error: "Forbidden: Company access required" }, { status: 403 });
        }

        const company = await getCompanyByUserId(decoded.id);
        if (!company) {
            return NextResponse.json({ error: "Company profile not found" }, { status: 404 });
        }

        const body = await req.json();
        const { title, description, location, type } = body;

        if (!title || !description || !location || !type) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const internship = await prisma.internship.create({
            data: {
                title,
                description,
                location,
                type,
                companyId: company.id,
            },
        });

        return NextResponse.json(internship, { status: 201 });
    } catch (error) {
        console.error("POST /api/internships error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const internships = await prisma.internship.findMany({
            include: {
                company: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(internships);
    } catch (error) {
        console.error("GET /api/internships error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}