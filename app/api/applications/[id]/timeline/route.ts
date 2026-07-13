import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError, apiForbidden, apiNotFound } from "@/lib/api-response";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: applicationId } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return apiForbidden("You must be logged in to view application timeline");
    }

    // Verify application existence and authorization
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        student: { select: { userId: true } },
        internship: {
          select: {
            companyId: true,
            company: { select: { userId: true } },
          },
        },
      },
    });

    if (!application) {
      return apiNotFound("Application not found");
    }

    const isAuthorized =
      user.role === "ADMIN" ||
      (user.role === "STUDENT" && application.student.userId === user.id) ||
      (user.role === "COMPANY" && application.internship.company.userId === user.id);

    if (!isAuthorized) {
      return apiForbidden("You are not authorized to view this application timeline");
    }

    // Retrieve activity logs for this application
    const logs = await prisma.activityLog.findMany({
      where: {
        metadata: {
          path: ["applicationId"],
          equals: applicationId,
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return apiSuccess(logs);
  } catch (error) {
    console.error("Error in GET /api/applications/[id]/timeline:", error);
    return apiError("Failed to retrieve timeline data", 500);
  }
}
