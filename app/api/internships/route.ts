import { getCurrentUser } from "@/lib/current-user";
import { requireCompany } from "@/lib/permissions";
import { createInternshipSchema } from "@/validators/internship.validator";
import { getAllInternships, createInternship } from "@/lib/services/internship.service";
import { apiSuccess, apiValidationError, apiError, apiForbidden, apiNotFound } from "@/lib/api-response";
import { logger } from "@/lib/logger";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const type = searchParams.get("type") || undefined;

    const internships = await getAllInternships(search, type);
    return apiSuccess(internships);
  } catch (error) {
    logger.error("Error in GET /api/internships", error);
    return apiError("Failed to fetch internships", 500);
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    
    try {
      requireCompany(user);
    } catch {
      return apiForbidden("Only companies are permitted to create internship postings");
    }

    if (!user?.companyId) {
      return apiNotFound("Company profile not found for this account");
    }

    const body = await req.json();
    const validation = createInternshipSchema.safeParse(body);

    if (!validation.success) {
      return apiValidationError(validation.error.flatten().fieldErrors);
    }

    const internship = await createInternship(user.companyId, validation.data);
    logger.info(`Internship created: "${internship.title}" by company ID: ${user.companyId}`);

    return apiSuccess(internship, 201);
  } catch (error) {
    logger.error("Error in POST /api/internships", error);
    return apiError("Failed to create internship posting", 500);
  }
}