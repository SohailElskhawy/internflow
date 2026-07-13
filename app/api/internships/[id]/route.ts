import { getCurrentUser } from "@/lib/current-user";
import { requireCompany } from "@/lib/permissions";
import { updateInternshipSchema } from "@/validators/internship.validator";
import { getInternshipById, updateInternship, deleteInternship } from "@/lib/services/internship.service";
import { apiSuccess, apiValidationError, apiError, apiForbidden, apiNotFound } from "@/lib/api-response";
import { logger } from "@/lib/logger";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const internship = await getInternshipById(id);

    if (!internship) {
      return apiNotFound("Internship posting not found");
    }

    return apiSuccess(internship);
  } catch (error) {
    logger.error("Error in GET /api/internships/[id]", error);
    return apiError("Failed to fetch internship details", 500);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    try {
      requireCompany(user);
    } catch {
      return apiForbidden("Only companies are permitted to update internship postings");
    }

    if (!user?.companyId) {
      return apiNotFound("Company profile not found");
    }

    const body = await req.json();
    const validation = updateInternshipSchema.safeParse(body);

    if (!validation.success) {
      return apiValidationError(validation.error.flatten().fieldErrors);
    }

    const result = await updateInternship(id, user.companyId, validation.data);

    if (result.error) {
      return apiError(result.error, result.code);
    }

    logger.info(`Internship ID ${id} updated by company ID ${user.companyId}`);
    return apiSuccess(result.data);
  } catch (error) {
    logger.error("Error in PATCH /api/internships/[id]", error);
    return apiError("Failed to update internship posting", 500);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    try {
      requireCompany(user);
    } catch {
      return apiForbidden("Only companies are permitted to delete internship postings");
    }

    if (!user?.companyId) {
      return apiNotFound("Company profile not found");
    }

    const result = await deleteInternship(id, user.companyId);

    if (result.error) {
      return apiError(result.error, result.code);
    }

    logger.info(`Internship ID ${id} deleted by company ID ${user.companyId}`);
    return apiSuccess({ deleted: true });
  } catch (error) {
    logger.error("Error in DELETE /api/internships/[id]", error);
    return apiError("Failed to delete internship posting", 500);
  }
}