import { getCurrentUser } from "@/lib/current-user";
import { requireAdmin } from "@/lib/permissions";
import { getAllUsers } from "@/lib/services/admin.service";
import { apiSuccess, apiError, apiForbidden } from "@/lib/api-response";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const user = await getCurrentUser();

    try {
      requireAdmin(user);
    } catch {
      return apiForbidden("Only administrators can access user management");
    }

    const users = await getAllUsers();
    return apiSuccess(users);
  } catch (error) {
    logger.error("Error in GET /api/admin/users", error);
    return apiError("Failed to fetch user list", 500);
  }
}
