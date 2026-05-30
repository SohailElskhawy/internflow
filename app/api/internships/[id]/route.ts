import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    const internship = await prisma.internship.findUnique({
        where: {
            id: params.id,
        },
        include: {
            company: true,
        },
    });

    return NextResponse.json(internship);
}