import { getCurrentUser } from "@/lib/current-user";
import { requireCompany } from "@/lib/permissions";
import { apiSuccess, apiError, apiForbidden, apiUnauthorized, apiNotFound } from "@/lib/api-response";
import { getCompanyAiInsights } from "@/lib/services/ai-insights.service";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return apiUnauthorized();

    try {
      requireCompany(user);
    } catch {
      return apiForbidden("Only companies can access AI recruiter insights");
    }

    if (!user.companyId) {
      return apiNotFound("Company profile not found");
    }

    const insights = await getCompanyAiInsights(user.companyId);
    return apiSuccess(insights);
  } catch (error) {
    logger.error("Error in GET /api/ai/company-insights", error);
    return apiError("Failed to fetch company AI insights", 500);
  }
}
