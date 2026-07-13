import { loginSchema } from "@/validators/auth.validator";
import { loginUser } from "@/lib/services/auth.service";
import { apiSuccess, apiValidationError, apiError } from "@/lib/api-response";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return apiValidationError(validation.error.flatten().fieldErrors);
    }

    const result = await loginUser(validation.data);

    if (result.error || !result.data) {
      logger.warn(`Failed login attempt for email: ${validation.data.email}`);
      return apiError(result.error || "Login failed", result.code || 400);
    }

    logger.info(`User logged in successfully: ${result.data.user.email}`);

    const response = apiSuccess(result.data, 200);
    response.cookies.set("token", result.data.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    logger.error("Error in POST /api/auth/login", error);
    return apiError("An internal server error occurred during login", 500);
  }
}