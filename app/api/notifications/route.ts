import { getCurrentUser } from "@/lib/current-user";
import { NotificationService } from "@/lib/services/notification.service";
import { apiSuccess, apiError, apiForbidden } from "@/lib/api-response";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return apiForbidden("You must be logged in to view notifications");
    }

    const notifications = await NotificationService.getNotifications(user.id);
    const unreadCount = await NotificationService.getUnreadCount(user.id);

    return apiSuccess({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Error in GET /api/notifications:", error);
    return apiError("Failed to retrieve notifications", 500);
  }
}
