import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { loginUser, registerUser } from "@/lib/services/auth.service";
import { prisma } from "@/lib/db";

describe("Auth Service Tests", () => {
  const STUDENT_EMAIL = "auth_test_student_123@test.internflow.com";
  const COMPANY_EMAIL = "auth_test_company_123@test.internflow.com";
  const PASSWORD = "Password123!";

  async function cleanup() {
    const testUsers = await prisma.user.findMany({
      where: {
        email: { in: [STUDENT_EMAIL, COMPANY_EMAIL] },
      },
    });

    for (const u of testUsers) {
      if (u.role === "STUDENT") {
        const student = await prisma.studentProfile.findUnique({ where: { userId: u.id } });
        if (student) {
          await prisma.application.deleteMany({ where: { studentId: student.id } });
          await prisma.resumeAnalysis.deleteMany({ where: { studentId: student.id } });
          await prisma.jobMatchResult.deleteMany({ where: { studentId: student.id } });
          await prisma.interviewPrep.deleteMany({ where: { studentId: student.id } });
          await prisma.studentProfile.delete({ where: { id: student.id } });
        }
      } else if (u.role === "COMPANY") {
        const company = await prisma.company.findUnique({ where: { userId: u.id } });
        if (company) {
          const internships = await prisma.internship.findMany({ where: { companyId: company.id } });
          const internshipIds = internships.map((i) => i.id);
          await prisma.application.deleteMany({ where: { internshipId: { in: internshipIds } } });
          await prisma.jobMatchResult.deleteMany({ where: { internshipId: { in: internshipIds } } });
          await prisma.interviewPrep.deleteMany({ where: { internshipId: { in: internshipIds } } });
          await prisma.internship.deleteMany({ where: { companyId: company.id } });
          await prisma.company.delete({ where: { id: company.id } });
        }
      }
      await prisma.user.delete({ where: { id: u.id } });
    }
  }

  beforeAll(async () => {
    await cleanup();
  });

  afterAll(async () => {
    await cleanup();
  });

  it("should successfully register a student user and create a profile", async () => {
    const result = await registerUser({
      name: "Test Student",
      email: STUDENT_EMAIL,
      password: PASSWORD,
      role: "STUDENT",
    });

    expect(result.code).toBe(201);
    expect(result.data).toBeDefined();
    expect(result.data?.user.email).toBe(STUDENT_EMAIL.toLowerCase());
    expect(result.data?.user.role).toBe("STUDENT");
    expect(result.data?.token).toBeDefined();

    // Verify DB profile
    const userInDb = await prisma.user.findUnique({
      where: { email: STUDENT_EMAIL.toLowerCase() },
      include: { student: true },
    });
    expect(userInDb).toBeDefined();
    expect(userInDb?.student).toBeDefined();
    expect(userInDb?.student?.university).toBe("Not specified");
  });

  it("should prevent registering an existing email", async () => {
    const result = await registerUser({
      name: "Duplicate Student",
      email: STUDENT_EMAIL,
      password: PASSWORD,
      role: "STUDENT",
    });

    expect(result.code).toBe(400);
    expect(result.error).toContain("exists");
  });

  it("should successfully register a company user and create a profile", async () => {
    const result = await registerUser({
      name: "Test Company",
      email: COMPANY_EMAIL,
      password: PASSWORD,
      role: "COMPANY",
    });

    expect(result.code).toBe(201);
    expect(result.data?.user.email).toBe(COMPANY_EMAIL.toLowerCase());
    expect(result.data?.user.role).toBe("COMPANY");

    // Verify DB company
    const userInDb = await prisma.user.findUnique({
      where: { email: COMPANY_EMAIL.toLowerCase() },
      include: { company: true },
    });
    expect(userInDb?.company).toBeDefined();
    expect(userInDb?.company?.approved).toBe(false);
  });

  it("should successfully log in a registered user", async () => {
    const result = await loginUser({
      email: STUDENT_EMAIL,
      password: PASSWORD,
    });

    expect(result.code).toBe(200);
    expect(result.data?.token).toBeDefined();
    expect(result.data?.user.email).toBe(STUDENT_EMAIL.toLowerCase());
  });

  it("should fail log in with incorrect password", async () => {
    const result = await loginUser({
      email: STUDENT_EMAIL,
      password: "wrongpassword",
    });

    expect(result.code).toBe(401);
    expect(result.error).toBeDefined();
  });

  it("should fail log in with non-existent email", async () => {
    const result = await loginUser({
      email: "nonexistent@test.internflow.com",
      password: PASSWORD,
    });

    expect(result.code).toBe(401);
    expect(result.error).toBeDefined();
  });
});
