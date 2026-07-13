import { getCurrentUser } from "@/lib/current-user";
import { apiSuccess, apiUnauthorized, apiError } from "@/lib/api-response";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return apiUnauthorized("Not authenticated");
    }
    return apiSuccess({ user });
  } catch (error) {
    logger.error("Error in GET /api/auth/me", error);
    return apiError("Failed to fetch authenticated user profile", 500);
  }
}
