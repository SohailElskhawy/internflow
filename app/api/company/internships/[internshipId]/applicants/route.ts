import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { getCompanyByUserId } from "@/lib/services/company.service";
import { getApplicantsForInternship } from "@/lib/services/application.service";
import { NextResponse } from "next/server";
import { Status } from "@prisma/client";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ internshipId: string }> }
) {
    try {
        const { internshipId } = await params;
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

        // Parse search params
        const { searchParams } = new URL(req.url);
        const statusParam = searchParams.get("status");
        const searchQuery = searchParams.get("search") || undefined;

        let statusFilter: Status | undefined = undefined;
        if (statusParam && Object.values(Status).includes(statusParam as Status)) {
            statusFilter = statusParam as Status;
        }

        const result = await getApplicantsForInternship(internshipId, company.id, {
            status: statusFilter,
            search: searchQuery,
        });

        if ("error" in result) {
            return NextResponse.json({ error: result.error }, { status: result.code });
        }

        return NextResponse.json({
            data: result.data,
            internshipTitle: result.internshipTitle,
        });
    } catch (error) {
        console.error("GET /api/company/internships/[internshipId]/applicants error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
