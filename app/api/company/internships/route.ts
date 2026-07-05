import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { getCompanyByUserId } from "@/lib/services/company.service";
import { getCompanyDashboardStats } from "@/lib/services/company-dashboard.service";
import { NextResponse } from "next/server";

export async function GET() {
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

        const statsData = await getCompanyDashboardStats(company.id);

        return NextResponse.json(statsData);
    } catch (error) {
        console.error("GET /api/company/internships error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
