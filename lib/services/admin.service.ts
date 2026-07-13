import { prisma } from "@/lib/db";

export async function getAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      student: { select: { id: true, university: true, major: true } },
      company: { select: { id: true, name: true, approved: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function toggleCompanyApproval(companyId: string, approved: boolean) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    return { error: "Company not found", code: 404 };
  }

  const updated = await prisma.company.update({
    where: { id: companyId },
    data: { approved },
  });

  return { data: updated, code: 200 };
}
