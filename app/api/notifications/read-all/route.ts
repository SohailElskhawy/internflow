import { getCurrentUser } from "@/lib/current-user";
import { NotificationService } from "@/lib/services/notification.service";
import { apiSuccess, apiError, apiForbidden } from "@/lib/api-response";

export async function PATCH() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return apiForbidden("You must be logged in to modify notifications");
    }

    await NotificationService.markAllAsRead(user.id);
    return apiSuccess({ success: true });
  } catch (error) {
    console.error("Error in PATCH /api/notifications/read-all:", error);
    return apiError("Failed to mark notifications as read", 500);
  }
}
