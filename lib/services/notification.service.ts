import { prisma } from "@/lib/db";
import { NotificationType } from "@prisma/client";

export class NotificationService {
  public static async notify(params: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
  }) {
    try {
      // Respect user's pushNotifications preference for showing in-app notifications
      const preference = await this.getOrCreatePreferences(params.userId);
      if (!preference.pushNotifications) {
        return null;
      }

      return await prisma.notification.create({
        data: {
          userId: params.userId,
          title: params.title,
          message: params.message,
          type: params.type,
        },
      });
    } catch (error) {
      console.error("Error creating notification in NotificationService:", error);
      throw error;
    }
  }

  public static async getNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  public static async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, read: false },
    });
  }

  public static async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      throw new Error("Notification not found or unauthorized");
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }

  public static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  public static async getOrCreatePreferences(userId: string) {
    let preference = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!preference) {
      preference = await prisma.notificationPreference.create({
        data: {
          userId,
          emailApplications: true,
          emailInternships: true,
          emailMarketing: false,
          pushNotifications: true,
        },
      });
    }

    return preference;
  }

  public static async updatePreferences(
    userId: string,
    data: {
      emailApplications?: boolean;
      emailInternships?: boolean;
      emailMarketing?: boolean;
      pushNotifications?: boolean;
    }
  ) {
    const preference = await this.getOrCreatePreferences(userId);

    return prisma.notificationPreference.update({
      where: { id: preference.id },
      data,
    });
  }
}
