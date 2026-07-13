import { prisma } from "@/lib/db";

import { getCachedData, setCachedData } from "@/lib/redis";

export async function getCompanyDashboardStats(companyId: string) {
    const cacheKey = `dashboard:company:${companyId}`;
    const cachedStats = await getCachedData<any>(cacheKey);
    if (cachedStats) {
        return cachedStats;
    }

    const internships = await prisma.internship.findMany({
        where: { companyId },
        include: {
            applications: {
                select: {
                    status: true
                }
            },
            _count: {
                select: {
                    applications: true
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    let totalApplications = 0;
    let pendingCount = 0;
    let acceptedCount = 0;
    let rejectedCount = 0;

    internships.forEach(internship => {
        internship.applications.forEach(app => {
            totalApplications++;
            if (app.status === "PENDING") pendingCount++;
            else if (app.status === "ACCEPTED") acceptedCount++;
            else if (app.status === "REJECTED") rejectedCount++;
        });
    });

    const result = {
        internshipCount: internships.length,
        totalApplications,
        pendingCount,
        acceptedCount,
        rejectedCount,
        internships: internships.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            location: item.location,
            type: item.type,
            createdAt: item.createdAt,
            applicationCount: item._count.applications
        }))
    };

    await setCachedData(cacheKey, result, 86400); // Cache for 24 hours
    return result;
}
