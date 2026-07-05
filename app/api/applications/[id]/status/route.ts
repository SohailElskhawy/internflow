import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { getCompanyByUserId } from "@/lib/services/company.service";
import { updateApplicationStatus } from "@/lib/services/application.service";
import { NextResponse } from "next/server";
import { Status } from "@prisma/client";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: applicationId } = await params;
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
        const { status } = body;

        if (!status || !Object.values(Status).includes(status as Status)) {
            return NextResponse.json(
                { error: "Invalid status. Must be ACCEPTED or REJECTED" },
                { status: 400 }
            );
        }

        const result = await updateApplicationStatus(applicationId, company.id, status as Status);

        if ("error" in result) {
            return NextResponse.json({ error: result.error }, { status: result.code });
        }

        return NextResponse.json(result.data);
    } catch (error) {
        console.error("PATCH /api/applications/[id]/status error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
