import { getCurrentUser } from "@/lib/current-user";
import { requireAdmin } from "@/lib/permissions";
import { updateCompanyApprovalSchema } from "@/validators/company.validator";
import { toggleCompanyApproval } from "@/lib/services/admin.service";
import { apiSuccess, apiValidationError, apiError, apiForbidden } from "@/lib/api-response";
import { logger } from "@/lib/logger";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: companyId } = await params;
    const user = await getCurrentUser();

    try {
      requireAdmin(user);
    } catch {
      return apiForbidden("Only administrators can approve or reject companies");
    }

    const body = await req.json();
    const validation = updateCompanyApprovalSchema.safeParse(body);

    if (!validation.success) {
      return apiValidationError(validation.error.flatten().fieldErrors);
    }

    const result = await toggleCompanyApproval(companyId, validation.data.approved);

    if ("error" in result && result.error) {
      return apiError(result.error, result.code || 400);
    }

    logger.info(`Company ${companyId} approval set to ${validation.data.approved} by admin ${user?.id}`);
    return apiSuccess(result.data);
  } catch (error) {
    logger.error("Error in PATCH /api/admin/companies/[id]/approval", error);
    return apiError("Failed to update company approval status", 500);
  }
}
