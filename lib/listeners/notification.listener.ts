import { eventBus, EVENTS, EventPayloads } from "@/lib/event-bus";
import { NotificationService } from "@/lib/services/notification.service";
import { prisma } from "@/lib/db";

// -- Register listeners --

// 1. Listen for new applications to notify the company
eventBus.on(EVENTS.APPLICATION_CREATED, async (payload: EventPayloads[typeof EVENTS.APPLICATION_CREATED]) => {
  try {
    // Find the company's userId to notify them
    const company = await prisma.company.findUnique({
      where: { id: payload.companyId },
      select: { userId: true },
    });

    if (company) {
      await NotificationService.notify({
        userId: company.userId,
        title: "New Application Received 📄",
        message: `${payload.studentName} has applied for your internship position: "${payload.internshipTitle}".`,
        type: "APPLICATION",
      });
    }
  } catch (error) {
    console.error("Error in APPLICATION_CREATED notification listener:", error);
  }
});

// 2. Listen for application acceptance to notify the student
eventBus.on(EVENTS.APPLICATION_ACCEPTED, async (payload: EventPayloads[typeof EVENTS.APPLICATION_ACCEPTED]) => {
  try {
    await NotificationService.notify({
      userId: payload.studentUserId,
      title: "Application Accepted! 🎉",
      message: `Congratulations! Your application for "${payload.internshipTitle}" at ${payload.companyName} has been accepted.`,
      type: "APPLICATION",
    });
  } catch (error) {
    console.error("Error in APPLICATION_ACCEPTED notification listener:", error);
  }
});

// 3. Listen for application rejection to notify the student
eventBus.on(EVENTS.APPLICATION_REJECTED, async (payload: EventPayloads[typeof EVENTS.APPLICATION_REJECTED]) => {
  try {
    await NotificationService.notify({
      userId: payload.studentUserId,
      title: "Application Status Update 💬",
      message: `Your application for "${payload.internshipTitle}" at ${payload.companyName} has been reviewed.`,
      type: "APPLICATION",
    });
  } catch (error) {
    console.error("Error in APPLICATION_REJECTED notification listener:", error);
  }
});

// 4. Listen for new internships to notify matching students
eventBus.on(EVENTS.NEW_INTERNSHIP, async (payload: EventPayloads[typeof EVENTS.NEW_INTERNSHIP]) => {
  try {
    // Notify all students
    const students = await prisma.studentProfile.findMany({
      select: { userId: true },
    });

    for (const student of students) {
      await NotificationService.notify({
        userId: student.userId,
        title: "New Internship Opportunity! 🚀",
        message: `"${payload.title}" was recently posted by ${payload.companyName}. Check it out now!`,
        type: "INTERNSHIP",
      });
    }
  } catch (error) {
    console.error("Error in NEW_INTERNSHIP notification listener:", error);
  }
});
