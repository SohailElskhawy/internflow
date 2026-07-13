import { getCurrentUser } from "@/lib/current-user";
import { requireCompany } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError, apiForbidden, apiNotFound } from "@/lib/api-response";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: applicationId } = await params;
    const user = await getCurrentUser();

    try {
      requireCompany(user);
    } catch {
      return apiForbidden("Only companies can trigger applicant views");
    }

    if (!user?.companyId) {
      return apiNotFound("Company profile not found");
    }

    // Verify application belongs to this company's internship
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        student: { select: { userId: true } },
        internship: { select: { companyId: true } },
      },
    });

    if (!application) {
      return apiNotFound("Application not found");
    }

    if (application.internship.companyId !== user.companyId) {
      return apiForbidden("You are not authorized to access this application");
    }

    // Emit event
    const { eventBus, EVENTS } = await import("@/lib/events");
    eventBus.emit(EVENTS.APPLICATION_VIEWED, {
      applicationId: application.id,
      companyId: user.companyId,
      studentUserId: application.student.userId,
    });

    return apiSuccess({ success: true });
  } catch (error) {
    console.error("Error in POST /api/applications/[id]/view:", error);
    return apiError("Failed to record application view", 500);
  }
}
