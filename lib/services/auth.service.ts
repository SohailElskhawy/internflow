import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";
import { LoginInput, RegisterInput } from "@/validators/auth.validator";
import { Role } from "@prisma/client";

export async function loginUser(input: LoginInput) {
  const normalizedEmail = input.email.trim().toLowerCase();

  const user = await prisma.user.findFirst({
    where: {
      email: {
        equals: normalizedEmail,
        mode: "insensitive",
      },
    },
    include: {
      student: true,
      company: true,
    },
  });

  if (!user) {
    return { error: "Invalid email or password", code: 401 };
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.password);
  if (!isPasswordValid) {
    return { error: "Invalid email or password", code: 401 };
  }

  const token = signToken({ id: user.id, role: user.role });

  return {
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.student?.id || null,
        companyId: user.company?.id || null,
      },
    },
    code: 200,
  };
}

export async function registerUser(input: RegisterInput) {
  const normalizedEmail = input.email.trim().toLowerCase();

  const existingUser = await prisma.user.findFirst({
    where: {
      email: {
        equals: normalizedEmail,
        mode: "insensitive",
      },
    },
  });

  if (existingUser) {
    return { error: "User with this email already exists", code: 400 };
  }

  const hashedPassword = await bcrypt.hash(input.password, 10);
  const role = input.role as Role;

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        name: input.name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: role,
      },
    });

    if (role === Role.STUDENT) {
      await tx.studentProfile.create({
        data: {
          userId: newUser.id,
          university: "Not specified",
          major: "Not specified",
          skills: [],
        },
      });
    } else if (role === Role.COMPANY) {
      await tx.company.create({
        data: {
          userId: newUser.id,
          name: input.name.trim(),
          description: "No description provided yet.",
          approved: false,
        },
      });
    }

    return newUser;
  });

  const token = signToken({ id: user.id, role: user.role });

  return {
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
    code: 201,
  };
}
