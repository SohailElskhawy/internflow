import { getCurrentUser } from "@/lib/current-user";
import { requireStudent } from "@/lib/permissions";
import { apiSuccess, apiError, apiForbidden, apiUnauthorized, apiValidationError } from "@/lib/api-response";
import { generateCoverLetter } from "@/lib/services/cover-letter.service";
import { coverLetterSchema } from "@/validators/ai.validator";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiUnauthorized();

    try {
      requireStudent(user);
    } catch {
      return apiForbidden("Only students can generate cover letters");
    }

    if (!user.studentId) return apiError("Student profile not found", 404);

    const body = await req.json();
    const validation = coverLetterSchema.safeParse(body);
    if (!validation.success) {
      return apiValidationError(validation.error.flatten().fieldErrors);
    }

    const { internshipId, customNotes } = validation.data;
    const result = await generateCoverLetter(user.studentId, internshipId, customNotes);

    return apiSuccess(result, 201);
  } catch (error) {
    logger.error("Error in POST /api/ai/cover-letter", error);
    return apiError("Failed to generate cover letter", 500);
  }
}
