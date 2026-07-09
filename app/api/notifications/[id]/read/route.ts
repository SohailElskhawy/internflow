import { getCurrentUser } from "@/lib/current-user";
import { NotificationService } from "@/lib/services/notification.service";
import { apiSuccess, apiError, apiForbidden } from "@/lib/api-response";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return apiForbidden("You must be logged in to modify notifications");
    }

    const updated = await NotificationService.markAsRead(id, user.id);
    return apiSuccess(updated);
  } catch (error) {
    console.error(`Error in PATCH /api/notifications/${(await params).id}/read:`, error);
    return apiError("Failed to mark notification as read", 500);
  }
}
