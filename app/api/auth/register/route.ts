import { registerSchema } from "@/validators/auth.validator";
import { registerUser } from "@/lib/services/auth.service";
import { apiSuccess, apiValidationError, apiError } from "@/lib/api-response";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return apiValidationError(validation.error.flatten().fieldErrors);
    }

    const result = await registerUser(validation.data);

    if (result.error || !result.data) {
      logger.warn(`Failed registration attempt for email: ${validation.data.email} - ${result.error}`);
      return apiError(result.error || "Registration failed", result.code || 400);
    }

    logger.info(`User registered successfully: ${result.data.user.email} (${result.data.user.role})`);

    const response = apiSuccess(result.data, 201);
    response.cookies.set("token", result.data.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    logger.error("Error in POST /api/auth/register", error);
    return apiError("An internal server error occurred during registration", 500);
  }
}