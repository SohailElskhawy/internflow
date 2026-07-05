import { prisma } from "@/lib/db";
import { StudentProfileInput } from "@/validators/student.validator";

export async function getStudentProfileByUserId(userId: string) {
  return prisma.studentProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function upsertStudentProfile(userId: string, data: StudentProfileInput) {
  return prisma.studentProfile.upsert({
    where: { userId },
    create: {
      userId,
      university: data.university,
      major: data.major,
      skills: data.skills,
      cvUrl: data.cvUrl || null,
    },
    update: {
      university: data.university,
      major: data.major,
      skills: data.skills,
      cvUrl: data.cvUrl || null,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}
