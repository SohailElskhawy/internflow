import { cookies } from "next/headers";
import { verifyToken } from "./auth";
import { prisma } from "./db";
import { Role } from "@prisma/client";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  studentId?: string | null;
  companyId?: string | null;
  companyApproved?: boolean;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    const decoded = verifyToken(token) as { id: string; role: string } | null;
    if (!decoded || !decoded.id) return null;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        student: { select: { id: true } },
        company: { select: { id: true, approved: true } },
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.student?.id || null,
      companyId: user.company?.id || null,
      companyApproved: user.company?.approved ?? false,
    };
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }
}
