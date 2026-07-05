import { prisma } from "@/lib/db";
import { CreateInternshipInput, UpdateInternshipInput } from "@/validators/internship.validator";

export async function getAllInternships(search?: string, type?: string) {
  const whereCondition: Record<string, unknown> = {};

  if (search && search.trim() !== "") {
    whereCondition.OR = [
      { title: { contains: search.trim(), mode: "insensitive" } },
      { description: { contains: search.trim(), mode: "insensitive" } },
      { location: { contains: search.trim(), mode: "insensitive" } },
      { company: { name: { contains: search.trim(), mode: "insensitive" } } },
    ];
  }

  if (type && type !== "ALL") {
    whereCondition.type = { equals: type, mode: "insensitive" };
  }

  return prisma.internship.findMany({
    where: whereCondition,
    include: {
      company: {
        select: {
          id: true,
          name: true,
          description: true,
          approved: true,
        },
      },
      _count: {
        select: { applications: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getInternshipById(id: string) {
  return prisma.internship.findUnique({
    where: { id },
    include: {
      company: true,
      _count: {
        select: { applications: true },
      },
    },
  });
}

export async function createInternship(companyId: string, input: CreateInternshipInput) {
  return prisma.internship.create({
    data: {
      title: input.title,
      description: input.description,
      location: input.location,
      type: input.type,
      companyId,
    },
    include: {
      company: true,
    },
  });
}

export async function updateInternship(internshipId: string, companyId: string, input: UpdateInternshipInput) {
  const existing = await prisma.internship.findUnique({
    where: { id: internshipId },
  });

  if (!existing) {
    return { error: "Internship not found", code: 404 };
  }

  if (existing.companyId !== companyId) {
    return { error: "Unauthorized to update this internship", code: 403 };
  }

  const updated = await prisma.internship.update({
    where: { id: internshipId },
    data: input,
  });

  return { data: updated, code: 200 };
}

export async function deleteInternship(internshipId: string, companyId: string) {
  const existing = await prisma.internship.findUnique({
    where: { id: internshipId },
  });

  if (!existing) {
    return { error: "Internship not found", code: 404 };
  }

  if (existing.companyId !== companyId) {
    return { error: "Unauthorized to delete this internship", code: 403 };
  }

  await prisma.internship.delete({
    where: { id: internshipId },
  });

  return { data: true, code: 200 };
}
