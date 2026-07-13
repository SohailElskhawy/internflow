import { prisma } from "@/lib/db";
import { Prisma, Status } from "@prisma/client";
import { eventBus, EVENTS } from "@/lib/events";

export async function getApplicantsForInternship(
    internshipId: string,
    companyId: string,
    options?: { status?: Status; search?: string }
) {
    // Verify internship belongs to company
    const internship = await prisma.internship.findUnique({
        where: { id: internshipId },
        select: { companyId: true, title: true }
    });

    if (!internship) {
        return { error: "Internship not found", code: 404 };
    }

    if (internship.companyId !== companyId) {
        return { error: "You don't have permission to view applicants for this internship", code: 403 };
    }

    // Build filter conditions
    const whereCondition: Prisma.ApplicationWhereInput = {
        internshipId,
    };

    if (options?.status) {
        whereCondition.status = options.status;
    }

    if (options?.search && options.search.trim() !== "") {
        const query = options.search.trim();
        whereCondition.student = {
            OR: [
                { user: { name: { contains: query, mode: "insensitive" } } },
                { university: { contains: query, mode: "insensitive" } },
                { major: { contains: query, mode: "insensitive" } },
            ]
        };
    }

    const applications = await prisma.application.findMany({
        where: whereCondition,
        include: {
            student: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        }
                    }
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    return { data: applications, internshipTitle: internship.title, code: 200 };
}

export async function updateApplicationStatus(
    applicationId: string,
    companyId: string,
    status: Status
) {
    // 1. Get application and include internship to verify company ownership
    const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: {
            internship: {
                select: {
                    companyId: true
                }
            }
        }
    });

    if (!application) {
        return { error: "Application not found", code: 404 };
    }

    // 2. Verify authorization: Internship must belong to the logged-in company
    if (application.internship.companyId !== companyId) {
        return { error: "You don't have permission to review this application", code: 403 };
    }

    // 3. Update status
    const updated = await prisma.application.update({
        where: { id: applicationId },
        data: { status },
        include: {
            student: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            },
            internship: {
                include: {
                    company: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            }
        }
    });

    // Emit event (non-blocking)
    const eventName = status === "ACCEPTED" ? EVENTS.APPLICATION_ACCEPTED : EVENTS.APPLICATION_REJECTED;
    eventBus.emit(eventName, {
        applicationId: updated.id,
        studentId: updated.studentId,
        internshipId: updated.internshipId,
        studentName: updated.student.user.name,
        internshipTitle: updated.internship.title,
        companyId: updated.internship.company.id,
        companyName: updated.internship.company.name,
        studentUserId: updated.student.user.id,
    });

    return { data: updated, code: 200 };
}

export async function getStudentApplications(studentProfileId: string) {
    return prisma.application.findMany({
        where: {
            studentId: studentProfileId
        },
        include: {
            internship: {
                include: {
                    company: {
                        select: {
                            name: true,
                            id: true
                        }
                    }
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });
}

export async function applyToInternship(studentProfileId: string, internshipId: string) {
    const existing = await prisma.application.findFirst({
        where: {
            studentId: studentProfileId,
            internshipId
        }
    });

    if (existing) {
        return { error: "You have already applied for this internship", code: 400 };
    }

    const application = await prisma.application.create({
        data: {
            studentId: studentProfileId,
            internshipId,
            status: "PENDING"
        }
    });

    // Look up details for the event payload in the background/non-blocking or synchronously
    try {
        const [student, internship] = await Promise.all([
            prisma.studentProfile.findUnique({
                where: { id: studentProfileId },
                include: { user: { select: { name: true } } }
            }),
            prisma.internship.findUnique({
                where: { id: internshipId },
                select: { title: true, companyId: true }
            })
        ]);

        if (student && internship) {
            eventBus.emit(EVENTS.APPLICATION_CREATED, {
                applicationId: application.id,
                studentId: studentProfileId,
                internshipId,
                studentName: student.user.name,
                internshipTitle: internship.title,
                companyId: internship.companyId,
            });
        }
    } catch (err) {
        console.error("Failed to emit APPLICATION_CREATED event:", err);
    }

    return { data: application, code: 201 };
}
