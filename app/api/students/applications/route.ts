import { getCurrentUser } from "@/lib/current-user";
import { requireStudent } from "@/lib/permissions";
import { getStudentApplications } from "@/lib/services/application.service";
import { apiSuccess, apiError, apiForbidden } from "@/lib/api-response";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const user = await getCurrentUser();

    try {
      requireStudent(user);
    } catch {
      return apiForbidden("Only students can view their applications");
    }

    if (!user?.studentId) {
      return apiSuccess([]);
    }

    const applications = await getStudentApplications(user.studentId);
    return apiSuccess(applications);
  } catch (error) {
    logger.error("Error in GET /api/students/applications", error);
    return apiError("Failed to fetch student applications", 500);
  }
}
