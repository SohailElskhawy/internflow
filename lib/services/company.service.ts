import { prisma } from "@/lib/db";

export async function getCompanyByUserId(userId: string) {
    return prisma.company.findUnique({
        where: { userId },
        include: { internships: true }
    });
}
