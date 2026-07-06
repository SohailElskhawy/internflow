import { getCurrentUser } from "@/lib/current-user";
import { requireCompany } from "@/lib/permissions";
import { apiSuccess, apiError, apiForbidden, apiUnauthorized, apiNotFound } from "@/lib/api-response";
import { getRankedApplicantsForInternship } from "@/lib/services/matching.service";
import { logger } from "@/lib/logger";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ internshipId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiUnauthorized();

    try {
      requireCompany(user);
    } catch {
      return apiForbidden("Only companies can view applicant candidate rankings");
    }

    if (!user.companyId) {
      return apiNotFound("Company profile not found");
    }

    const { internshipId } = await params;
    if (!internshipId) {
      return apiError("Missing internship ID", 400);
    }

    const rankings = await getRankedApplicantsForInternship(user.companyId, internshipId);
    return apiSuccess(rankings);
  } catch (error) {
    logger.error("Error in GET /api/ai/rankings/[internshipId]", error);
    return apiError("Failed to fetch applicant rankings", 500);
  }
}
