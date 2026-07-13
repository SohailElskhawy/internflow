import { getCurrentUser } from "@/lib/current-user";
import { requireStudent } from "@/lib/permissions";
import { apiSuccess, apiError, apiForbidden, apiUnauthorized, apiValidationError } from "@/lib/api-response";
import { askCareerAdvisor } from "@/lib/services/career-advisor.service";
import { aiChatSchema } from "@/validators/ai.validator";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiUnauthorized();

    try {
      requireStudent(user);
    } catch {
      return apiForbidden("Only students can chat with the AI Career Advisor");
    }

    if (!user.studentId) return apiError("Student profile not found", 404);

    const body = await req.json();
    const validation = aiChatSchema.safeParse(body);
    if (!validation.success) {
      return apiValidationError(validation.error.flatten().fieldErrors);
    }

    const response = await askCareerAdvisor(user.studentId, validation.data.message);
    return apiSuccess(response);
  } catch (error) {
    logger.error("Error in POST /api/ai/chat", error);
    return apiError("Failed to get career advisor response", 500);
  }
}
