import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { getStudentApplications } from "@/lib/services/application.service";

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded = verifyToken(token) as { id: string; role: string } | null;
        if (!decoded || decoded.role !== "STUDENT") {
            return NextResponse.json({ error: "Forbidden: Student access required" }, { status: 403 });
        }

        const studentProfile = await prisma.studentProfile.findUnique({
            where: { userId: decoded.id }
        });

        if (!studentProfile) {
            return NextResponse.json([], { status: 200 });
        }

        const applications = await getStudentApplications(studentProfile.id);
        return NextResponse.json(applications);
    } catch (error) {
        console.error("GET /api/students/applications error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
