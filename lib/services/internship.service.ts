import { prisma } from "@/lib/db";
import { CreateInternshipInput, UpdateInternshipInput } from "@/validators/internship.validator";
import { eventBus, EVENTS } from "@/lib/events";
import { getCachedData, setCachedData, invalidateCache } from "@/lib/redis";

export async function getAllInternships(
  search?: string,
  type?: string,
  options: {
    location?: string;
    sort?: string;
    page?: number;
    limit?: number;
    studentId?: string | null;
  } = {}
) {
  const { location, sort = "newest", page = 1, limit = 20, studentId = null } = options;
  const skip = (page - 1) * limit;

  const whereCondition: Record<string, any> = {};

  if (search && search.trim() !== "") {
    whereCondition.OR = [
      { title: { contains: search.trim(), mode: "insensitive" } },
      { description: { contains: search.trim(), mode: "insensitive" } },
      { company: { name: { contains: search.trim(), mode: "insensitive" } } },
    ];
  }

  if (type && type !== "ALL") {
    whereCondition.type = { equals: type, mode: "insensitive" };
  }

  if (location && location.trim() !== "") {
    whereCondition.location = { contains: location.trim(), mode: "insensitive" };
  }

  if (sort === "best_match" && studentId) {
    // Fetch all matching internships to sort them in memory
    const allInternships = await prisma.internship.findMany({
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
        matchResults: {
          where: { studentId },
          select: { matchScore: true },
        },
        _count: {
          select: { applications: true },
        },
      },
    });

    // Sort: Best match score descending, then newest created
    allInternships.sort((a, b) => {
      const scoreA = a.matchResults?.[0]?.matchScore ?? 0;
      const scoreB = b.matchResults?.[0]?.matchScore ?? 0;
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const total = allInternships.length;
    const sliced = allInternships.slice(skip, skip + limit);

    const mapped = sliced.map(({ matchResults, ...rest }) => ({
      ...rest,
      matchScore: matchResults?.[0]?.matchScore ?? null,
    }));

    return { internships: mapped, total };
  }

  // Database-level sorting and pagination for standard sorting options
  let orderByOption: any = { createdAt: "desc" };
  if (sort === "oldest") {
    orderByOption = { createdAt: "asc" };
  } else if (sort === "most_applicants") {
    orderByOption = {
      applications: {
        _count: "desc",
      },
    };
  }

  const total = await prisma.internship.count({ where: whereCondition });
  const internships = await prisma.internship.findMany({
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
      matchResults: studentId ? {
        where: { studentId },
        select: { matchScore: true },
      } : false,
    },
    orderBy: orderByOption,
    skip,
    take: limit,
  });

  const mapped = internships.map((item: any) => {
    const { matchResults, ...rest } = item;
    return {
      ...rest,
      matchScore: matchResults?.[0]?.matchScore ?? null,
    };
  });

  return { internships: mapped, total };
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
  const internship = await prisma.internship.create({
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

  // Emit event (non-blocking)
  eventBus.emit(EVENTS.NEW_INTERNSHIP, {
    internshipId: internship.id,
    companyId,
    title: internship.title,
    companyName: internship.company.name,
    location: internship.location,
    type: internship.type,
  });

  // Invalidate company dashboard cache
  await invalidateCache(`dashboard:company:${companyId}`);

  return internship;
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

  // Invalidate company dashboard cache
  await invalidateCache(`dashboard:company:${companyId}`);

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

  // Invalidate company dashboard cache
  await invalidateCache(`dashboard:company:${companyId}`);

  return { data: true, code: 200 };
}

export async function getPopularInternships(limit: number = 4) {
  const cacheKey = "internships:popular";
  const cached = await getCachedData<any[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const popular = await prisma.internship.findMany({
    take: limit,
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
      applications: {
        _count: "desc",
      },
    },
  });

  await setCachedData(cacheKey, popular, 300); // 5 minutes TTL
  return popular;
}
