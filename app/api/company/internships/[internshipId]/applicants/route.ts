import { getCurrentUser } from "@/lib/current-user";
import { requireCompany } from "@/lib/permissions";
import { getApplicantsForInternship } from "@/lib/services/application.service";
import { apiSuccess, apiError, apiForbidden, apiNotFound } from "@/lib/api-response";
import { logger } from "@/lib/logger";
import { Status } from "@prisma/client";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ internshipId: string }> }
) {
  try {
    const { internshipId } = await params;
    const user = await getCurrentUser();

    try {
      requireCompany(user);
    } catch {
      return apiForbidden("Only companies can view applicant details");
    }

    if (!user?.companyId) {
      return apiNotFound("Company profile not found");
    }

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");
    const searchQuery = searchParams.get("search") || undefined;

    let statusFilter: Status | undefined = undefined;
    if (statusParam && Object.values(Status).includes(statusParam as Status)) {
      statusFilter = statusParam as Status;
    }

    const result = await getApplicantsForInternship(internshipId, user.companyId, {
      status: statusFilter,
      search: searchQuery,
    });

    if ("error" in result && result.error) {
      return apiError(result.error, result.code || 400);
    }

    return apiSuccess({
      applications: result.data,
      internshipTitle: result.internshipTitle,
    });
  } catch (error) {
    logger.error("Error in GET /api/company/internships/[internshipId]/applicants", error);
    return apiError("Failed to fetch applicants list", 500);
  }
}
