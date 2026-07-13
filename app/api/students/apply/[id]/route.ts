import { getCurrentUser } from "@/lib/current-user";
import { requireStudent } from "@/lib/permissions";
import { applyToInternship } from "@/lib/services/application.service";
import { apiSuccess, apiError, apiForbidden, apiValidationError } from "@/lib/api-response";
import { logger } from "@/lib/logger";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: internshipId } = await params;
    const user = await getCurrentUser();

    try {
      requireStudent(user);
    } catch {
      return apiForbidden("Only students can apply for internships");
    }

    if (!user?.studentId) {
      return apiValidationError({ studentProfile: ["Please complete your student profile before applying for internships."] });
    }

    const result = await applyToInternship(user.studentId, internshipId);

    if ("error" in result && result.error) {
      return apiError(result.error, result.code || 400);
    }

    logger.info(`Student ${user.studentId} applied to internship ${internshipId}`);
    return apiSuccess(result.data, 201);
  } catch (error) {
    logger.error("Error in POST /api/students/apply/[id]", error);
    return apiError("Failed to submit internship application", 500);
  }
}
