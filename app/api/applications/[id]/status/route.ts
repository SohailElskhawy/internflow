import { getCurrentUser } from "@/lib/current-user";
import { requireCompany } from "@/lib/permissions";
import { updateApplicationStatusSchema } from "@/validators/application.validator";
import { updateApplicationStatus } from "@/lib/services/application.service";
import { apiSuccess, apiValidationError, apiError, apiForbidden, apiNotFound } from "@/lib/api-response";
import { logger } from "@/lib/logger";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: applicationId } = await params;
    const user = await getCurrentUser();

    try {
      requireCompany(user);
    } catch {
      return apiForbidden("Only companies are permitted to update applicant statuses");
    }

    if (!user?.companyId) {
      return apiNotFound("Company profile not found");
    }

    const body = await req.json();
    const validation = updateApplicationStatusSchema.safeParse(body);

    if (!validation.success) {
      return apiValidationError(validation.error.flatten().fieldErrors);
    }

    const result = await updateApplicationStatus(applicationId, user.companyId, validation.data.status);

    if ("error" in result && result.error) {
      return apiError(result.error, result.code || 400);
    }

    logger.info(`Application ${applicationId} status updated to ${validation.data.status} by company ${user.companyId}`);
    return apiSuccess(result.data);
  } catch (error) {
    logger.error("Error in PATCH /api/applications/[id]/status", error);
    return apiError("Failed to update application status", 500);
  }
}
