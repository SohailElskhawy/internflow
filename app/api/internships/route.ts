import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const body = await req.json();

    const companyId = body.companyId;

    const internship = await prisma.internship.create({
        data: {
            title: body.title,
            description: body.description,
            location: body.location,
            type: body.type,
            companyId,
        },
    });

    return NextResponse.json(internship);
}

export async function GET() {
    const internships = await prisma.internship.findMany({
        include: {
            company: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return NextResponse.json(internships);
}