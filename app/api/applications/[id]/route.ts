import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = verifyToken(token) as { id: string; role: string } | null;
        if (!decoded) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const application = await prisma.application.findUnique({
            where: { id },
            include: {
                student: { include: { user: true } },
                internship: { include: { company: true } }
            }
        });

        if (!application) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 });
        }

        // Check authorization:
        // Admin: allowed to view any application.
        // Student: allowed to view their own application.
        // Company: allowed to view applications for their internships.
        const isAuthorized =
            decoded.role === "ADMIN" ||
            (decoded.role === "STUDENT" && application.student.userId === decoded.id) ||
            (decoded.role === "COMPANY" && application.internship.company.userId === decoded.id);

        if (!isAuthorized) {
            return NextResponse.json({ error: "Forbidden: You are not authorized to view this application" }, { status: 403 });
        }

        return NextResponse.json(application);
    } catch (error) {
        console.error("GET /api/applications/[id] error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
