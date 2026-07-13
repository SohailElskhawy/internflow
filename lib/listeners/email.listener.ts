import { eventBus, EVENTS, EventPayloads } from "@/lib/event-bus";
import { EmailService } from "@/lib/services/email.service";
import { NotificationService } from "@/lib/services/notification.service";
import { prisma } from "@/lib/db";

// -- Register email listeners --

// 1. Send Welcome Email on User Registration
eventBus.on(EVENTS.USER_REGISTERED, async (payload: EventPayloads[typeof EVENTS.USER_REGISTERED]) => {
  try {
    const html = EmailService.getWelcomeEmailHtml(payload.name);
    await EmailService.sendEmail({
      to: payload.email,
      subject: "Welcome to InternFlow! 🚀",
      html,
    });
  } catch (error) {
    console.error("Error in USER_REGISTERED email listener:", error);
  }
});

// 2. Send Acceptance Email on Application Acceptance
eventBus.on(EVENTS.APPLICATION_ACCEPTED, async (payload: EventPayloads[typeof EVENTS.APPLICATION_ACCEPTED]) => {
  try {
    const preference = await NotificationService.getOrCreatePreferences(payload.studentUserId);
    if (!preference.emailApplications) return;

    const studentUser = await prisma.user.findUnique({
      where: { id: payload.studentUserId },
      select: { email: true },
    });

    if (studentUser) {
      const html = EmailService.getApplicationAcceptedEmailHtml({
        studentName: payload.studentName,
        internshipTitle: payload.internshipTitle,
        companyName: payload.companyName,
      });

      await EmailService.sendEmail({
        to: studentUser.email,
        subject: `Application Accepted: ${payload.internshipTitle} at ${payload.companyName}! 🎉`,
        html,
      });
    }
  } catch (error) {
    console.error("Error in APPLICATION_ACCEPTED email listener:", error);
  }
});

// 3. Send Rejection Email on Application Rejection
eventBus.on(EVENTS.APPLICATION_REJECTED, async (payload: EventPayloads[typeof EVENTS.APPLICATION_REJECTED]) => {
  try {
    const preference = await NotificationService.getOrCreatePreferences(payload.studentUserId);
    if (!preference.emailApplications) return;

    const studentUser = await prisma.user.findUnique({
      where: { id: payload.studentUserId },
      select: { email: true },
    });

    if (studentUser) {
      const html = EmailService.getApplicationRejectedEmailHtml({
        studentName: payload.studentName,
        internshipTitle: payload.internshipTitle,
        companyName: payload.companyName,
      });

      await EmailService.sendEmail({
        to: studentUser.email,
        subject: `Update regarding your application for ${payload.internshipTitle}`,
        html,
      });
    }
  } catch (error) {
    console.error("Error in APPLICATION_REJECTED email listener:", error);
  }
});

// 4. Send Email Alert on New Internship Posted
eventBus.on(EVENTS.NEW_INTERNSHIP, async (payload: EventPayloads[typeof EVENTS.NEW_INTERNSHIP]) => {
  try {
    // Find all students who have opted in for internship email alerts
    const preferences = await prisma.notificationPreference.findMany({
      where: { emailInternships: true },
      select: { userId: true },
    });

    const userIds = preferences.map((p) => p.userId);

    const students = await prisma.studentProfile.findMany({
      where: { userId: { in: userIds } },
      include: { user: { select: { name: true, email: true } } },
    });

    for (const student of students) {
      const html = EmailService.getNewInternshipEmailHtml({
        studentName: student.user.name,
        internshipTitle: payload.title,
        companyName: payload.companyName,
        location: payload.location,
        type: payload.type,
      });

      await EmailService.sendEmail({
        to: student.user.email,
        subject: `New Internship Match: ${payload.title} at ${payload.companyName}`,
        html,
      });
    }
  } catch (error) {
    console.error("Error in NEW_INTERNSHIP email listener:", error);
  }
});
