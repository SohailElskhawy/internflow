import { prisma } from "@/lib/db";
import { CompanyProfileInput } from "@/validators/company.validator";

export async function getCompanyByUserId(userId: string) {
  return prisma.company.findUnique({
    where: { userId },
    include: {
      internships: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getCompanyById(companyId: string) {
  return prisma.company.findUnique({
    where: { id: companyId },
    include: {
      internships: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getAllApprovedCompanies() {
  return prisma.company.findMany({
    include: {
      internships: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function updateCompanyProfile(userId: string, data: CompanyProfileInput) {
  return prisma.company.update({
    where: { userId },
    data: {
      name: data.name,
      description: data.description,
    },
  });
}
