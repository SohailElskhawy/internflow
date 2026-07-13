import { getCurrentUser } from "@/lib/current-user";
import { requireCompany } from "@/lib/permissions";
import { companyProfileSchema } from "@/validators/company.validator";
import { getAllApprovedCompanies, updateCompanyProfile } from "@/lib/services/company.service";
import { apiSuccess, apiValidationError, apiError, apiForbidden, apiNotFound } from "@/lib/api-response";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const companies = await getAllApprovedCompanies();
    return apiSuccess(companies);
  } catch (error) {
    logger.error("Error in GET /api/companies", error);
    return apiError("Failed to fetch companies list", 500);
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    try {
      requireCompany(user);
    } catch {
      return apiForbidden("Only companies can set up or update company profiles");
    }

    if (!user?.id) {
      return apiNotFound("User not found");
    }

    const body = await req.json();
    const validation = companyProfileSchema.safeParse(body);

    if (!validation.success) {
      return apiValidationError(validation.error.flatten().fieldErrors);
    }

    const company = await updateCompanyProfile(user.id, validation.data);
    logger.info(`Company profile updated for user ${user.id} (${company.name})`);

    return apiSuccess(company, 200);
  } catch (error) {
    logger.error("Error in POST /api/companies", error);
    return apiError("Failed to save company profile", 500);
  }
}