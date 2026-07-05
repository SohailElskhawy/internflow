import { getCurrentUser } from "@/lib/current-user";
import { requireCompany } from "@/lib/permissions";
import { getCompanyDashboardStats } from "@/lib/services/company-dashboard.service";
import { apiSuccess, apiError, apiForbidden, apiNotFound } from "@/lib/api-response";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const user = await getCurrentUser();

    try {
      requireCompany(user);
    } catch {
      return apiForbidden("Only companies can access dashboard stats");
    }

    if (!user?.companyId) {
      return apiNotFound("Company profile not found");
    }

    const statsData = await getCompanyDashboardStats(user.companyId);
    return apiSuccess(statsData);
  } catch (error) {
    logger.error("Error in GET /api/company/internships", error);
    return apiError("Failed to fetch company internships dashboard stats", 500);
  }
}
