import { getCurrentUser } from "@/lib/current-user";
import { NotificationService } from "@/lib/services/notification.service";
import { apiSuccess, apiError, apiForbidden } from "@/lib/api-response";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return apiForbidden("You must be logged in to view preferences");
    }

    const preferences = await NotificationService.getOrCreatePreferences(user.id);
    return apiSuccess(preferences);
  } catch (error) {
    console.error("Error in GET /api/notifications/preferences:", error);
    return apiError("Failed to fetch preferences", 500);
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return apiForbidden("You must be logged in to update preferences");
    }

    const body = await req.json();
    const updated = await NotificationService.updatePreferences(user.id, {
      emailApplications: body.emailApplications,
      emailInternships: body.emailInternships,
      emailMarketing: body.emailMarketing,
      pushNotifications: body.pushNotifications,
    });
    return apiSuccess(updated);
  } catch (error) {
    console.error("Error in PATCH /api/notifications/preferences:", error);
    return apiError("Failed to update preferences", 500);
  }
}
