import { getCurrentUser } from "@/lib/current-user";
import { requireStudent } from "@/lib/permissions";
import { studentProfileSchema } from "@/validators/student.validator";
import { getStudentProfileByUserId, upsertStudentProfile } from "@/lib/services/student.service";
import { apiSuccess, apiValidationError, apiError, apiForbidden, apiNotFound } from "@/lib/api-response";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const user = await getCurrentUser();

    try {
      requireStudent(user);
    } catch {
      return apiForbidden("Only students can view their profile");
    }

    if (!user?.id) {
      return apiNotFound("User not found");
    }

    const profile = await getStudentProfileByUserId(user.id);

    if (!profile) {
      return apiNotFound("Student profile not found");
    }

    return apiSuccess(profile);
  } catch (error) {
    logger.error("Error in GET /api/students/profile", error);
    return apiError("Failed to fetch student profile", 500);
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    try {
      requireStudent(user);
    } catch {
      return apiForbidden("Only students can update their profile");
    }

    if (!user?.id) {
      return apiNotFound("User not found");
    }

    const body = await req.json();
    const validation = studentProfileSchema.safeParse(body);

    if (!validation.success) {
      return apiValidationError(validation.error.flatten().fieldErrors);
    }

    const profile = await upsertStudentProfile(user.id, validation.data);
    logger.info(`Student profile updated for user ${user.id}`);

    return apiSuccess(profile);
  } catch (error) {
    logger.error("Error in POST /api/students/profile", error);
    return apiError("Failed to save student profile", 500);
  }
}