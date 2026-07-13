import { getCurrentUser } from "@/lib/current-user";
import { requireStudent } from "@/lib/permissions";
import { apiSuccess, apiError, apiForbidden, apiUnauthorized, apiValidationError } from "@/lib/api-response";
import { generateOrGetInterviewPrep } from "@/lib/services/interview-prep.service";
import { interviewPrepSchema } from "@/validators/ai.validator";
import { logger } from "@/lib/logger";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiUnauthorized();

    try {
      requireStudent(user);
    } catch {
      return apiForbidden("Only students can view interview preparation kits");
    }

    if (!user.studentId) return apiError("Student profile not found", 404);

    const { searchParams } = new URL(req.url);
    const internshipId = searchParams.get("internshipId");

    if (!internshipId) {
      return apiError("Missing required query parameter: internshipId", 400);
    }

    const prep = await generateOrGetInterviewPrep(user.studentId, internshipId);
    return apiSuccess(prep);
  } catch (error) {
    logger.error("Error in GET /api/ai/interview-prep", error);
    return apiError("Failed to fetch interview preparation kit", 500);
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiUnauthorized();

    try {
      requireStudent(user);
    } catch {
      return apiForbidden("Only students can generate interview preparation kits");
    }

    if (!user.studentId) return apiError("Student profile not found", 404);

    const body = await req.json();
    const validation = interviewPrepSchema.safeParse(body);
    if (!validation.success) {
      return apiValidationError(validation.error.flatten().fieldErrors);
    }

    const prep = await generateOrGetInterviewPrep(user.studentId, validation.data.internshipId);
    return apiSuccess(prep, 201);
  } catch (error) {
    logger.error("Error in POST /api/ai/interview-prep", error);
    return apiError("Failed to generate interview preparation kit", 500);
  }
}
