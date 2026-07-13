import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { apiSuccess, apiUnauthorized, apiForbidden, apiNotFound, apiError } from "@/lib/api-response";
import { logger } from "@/lib/logger";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return apiUnauthorized();
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return apiUnauthorized("Invalid token");
        }

        const application = await prisma.application.findUnique({
            where: { id },
            include: {
                student: { include: { user: true } },
                internship: { include: { company: true } }
            }
        });

        if (!application) {
            return apiNotFound("Application not found");
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
            return apiForbidden("You are not authorized to view this application");
        }

        // Trigger APPLICATION_VIEWED event if viewed by the company
        if (decoded.role === "COMPANY") {
            const { eventBus, EVENTS } = await import("@/lib/events");
            eventBus.emit(EVENTS.APPLICATION_VIEWED, {
                applicationId: application.id,
                companyId: application.internship.company.id,
                studentUserId: application.student.userId
            });
        }

        return apiSuccess(application);
    } catch (error) {
        logger.error("GET /api/applications/[id] error:", error);
        return apiError("An internal server error occurred while retrieving application");
    }
}
