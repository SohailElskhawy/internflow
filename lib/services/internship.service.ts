import { prisma } from "@/lib/db";

export async function getAllInternships() {
    return prisma.internship.findMany({
        include: {
            company: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}

export async function getInternshipById(id: string) {
    return await prisma.internship.findUnique({
        where: { id },
        include: {
            company: true,
            _count: {
                select: { applications: true }
            }
        }
    })
}
