import { getCurrentUser } from "@/lib/current-user";
import { requireStudent } from "@/lib/permissions";
import { apiSuccess, apiError, apiForbidden, apiUnauthorized, apiValidationError } from "@/lib/api-response";
import { calculateOrGetJobMatch } from "@/lib/services/matching.service";
import { matchJobSchema } from "@/validators/ai.validator";
import { logger } from "@/lib/logger";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiUnauthorized();

    try {
      requireStudent(user);
    } catch {
      return apiForbidden("Only students can view job match details");
    }

    if (!user.studentId) return apiError("Student profile not found", 404);

    const { searchParams } = new URL(req.url);
    const internshipId = searchParams.get("internshipId");

    if (!internshipId) {
      return apiError("Missing required query parameter: internshipId", 400);
    }

    const match = await calculateOrGetJobMatch(user.studentId, internshipId);
    return apiSuccess(match);
  } catch (error) {
    logger.error("Error in GET /api/ai/match", error);
    return apiError("Failed to retrieve job match score", 500);
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiUnauthorized();

    try {
      requireStudent(user);
    } catch {
      return apiForbidden("Only students can calculate job match scores");
    }

    if (!user.studentId) return apiError("Student profile not found", 404);

    const body = await req.json();
    const validation = matchJobSchema.safeParse(body);
    if (!validation.success) {
      return apiValidationError(validation.error.flatten().fieldErrors);
    }

    const match = await calculateOrGetJobMatch(user.studentId, validation.data.internshipId);
    return apiSuccess(match, 201);
  } catch (error) {
    logger.error("Error in POST /api/ai/match", error);
    return apiError("Failed to calculate job match score", 500);
  }
}
