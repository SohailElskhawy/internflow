import { eventBus, EVENTS, EventPayloads } from "@/lib/event-bus";
import { prisma } from "@/lib/db";

// Helper to log activities securely
async function logActivity(userId: string, action: string, metadata: Record<string, unknown>) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        metadata: metadata as any,
      },
    });
  } catch (error) {
    console.error(`Error writing activity log for action ${action}:`, error);
  }
}

// -- Register activity logging listeners --

// 1. User Registration
eventBus.on(EVENTS.USER_REGISTERED, async (payload: EventPayloads[typeof EVENTS.USER_REGISTERED]) => {
  await logActivity(payload.userId, "USER_REGISTERED", {
    email: payload.email,
    name: payload.name,
    role: payload.role,
  });
});

// 2. Application Submitted
eventBus.on(EVENTS.APPLICATION_CREATED, async (payload: EventPayloads[typeof EVENTS.APPLICATION_CREATED]) => {
  try {
    // Look up the student's userId
    const student = await prisma.studentProfile.findUnique({
      where: { id: payload.studentId },
      select: { userId: true },
    });

    if (student) {
      // Find company name for metadata
      const company = await prisma.company.findUnique({
        where: { id: payload.companyId },
        select: { name: true },
      });

      await logActivity(student.userId, "APPLICATION_SUBMITTED", {
        applicationId: payload.applicationId,
        internshipId: payload.internshipId,
        internshipTitle: payload.internshipTitle,
        companyId: payload.companyId,
        companyName: company?.name || "Unknown Company",
      });
    }
  } catch (error) {
    console.error("Error logging APPLICATION_CREATED:", error);
  }
});

// 3. Application Viewed by Company
eventBus.on(EVENTS.APPLICATION_VIEWED, async (payload: EventPayloads[typeof EVENTS.APPLICATION_VIEWED]) => {
  try {
    // Check if this application has already been marked as viewed to avoid duplicates
    const existingViewLog = await prisma.activityLog.findFirst({
      where: {
        userId: payload.studentUserId,
        action: "APPLICATION_VIEWED",
        metadata: {
          path: ["applicationId"],
          equals: payload.applicationId,
        },
      },
    });

    if (!existingViewLog) {
      // Log Viewed by Company
      await logActivity(payload.studentUserId, "APPLICATION_VIEWED", {
        applicationId: payload.applicationId,
        companyId: payload.companyId,
      });

      // Also transition to Under Review automatically!
      await logActivity(payload.studentUserId, "APPLICATION_UNDER_REVIEW", {
        applicationId: payload.applicationId,
        companyId: payload.companyId,
      });
    }
  } catch (error) {
    console.error("Error logging APPLICATION_VIEWED:", error);
  }
});

// 4. Application Accepted
eventBus.on(EVENTS.APPLICATION_ACCEPTED, async (payload: EventPayloads[typeof EVENTS.APPLICATION_ACCEPTED]) => {
  await logActivity(payload.studentUserId, "APPLICATION_ACCEPTED", {
    applicationId: payload.applicationId,
    internshipId: payload.internshipId,
    internshipTitle: payload.internshipTitle,
    companyId: payload.companyId,
    companyName: payload.companyName,
  });
});

// 5. Application Rejected
eventBus.on(EVENTS.APPLICATION_REJECTED, async (payload: EventPayloads[typeof EVENTS.APPLICATION_REJECTED]) => {
  await logActivity(payload.studentUserId, "APPLICATION_REJECTED", {
    applicationId: payload.applicationId,
    internshipId: payload.internshipId,
    internshipTitle: payload.internshipTitle,
    companyId: payload.companyId,
    companyName: payload.companyName,
  });
});

// 6. Internship Created
eventBus.on(EVENTS.NEW_INTERNSHIP, async (payload: EventPayloads[typeof EVENTS.NEW_INTERNSHIP]) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: payload.companyId },
      select: { userId: true },
    });

    if (company) {
      await logActivity(company.userId, "INTERNSHIP_CREATED", {
        internshipId: payload.internshipId,
        title: payload.title,
        location: payload.location,
        type: payload.type,
      });
    }
  } catch (error) {
    console.error("Error logging NEW_INTERNSHIP activity:", error);
  }
});
