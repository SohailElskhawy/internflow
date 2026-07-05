import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const internship = await prisma.internship.findUnique({
        where: {
            id,
        },
        include: {
            company: true,
        },
    });

    return NextResponse.json(internship);
}