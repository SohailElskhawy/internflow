import { getCurrentUser } from "@/lib/current-user";
import { apiSuccess, apiUnauthorized, apiError } from "@/lib/api-response";
import { logger } from "@/lib/logger";

import { cookies } from "next/headers";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      const cookieStore = await cookies();
      const hasToken = cookieStore.has("token");
      const response = apiUnauthorized("Not authenticated");
      
      if (hasToken) {
        cookieStore.delete("token");
        cookieStore.set("token", "", {
          path: "/",
          maxAge: 0,
          expires: new Date(0),
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        });
        response.cookies.delete("token");
      }
      
      return response;
    }
    return apiSuccess({ user });
  } catch (error) {
    logger.error("Error in GET /api/auth/me", error);
    return apiError("Failed to fetch authenticated user profile", 500);
  }
}
