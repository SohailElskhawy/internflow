import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  applyToInternship,
  getApplicantsForInternship,
  getStudentApplications,
  updateApplicationStatus,
} from "@/lib/services/application.service";
import { prisma } from "@/lib/db";

describe("Application Service Tests", () => {
  const STUDENT_EMAIL = "app_test_student_123@test.internflow.com";
  const COMPANY_EMAIL = "app_test_company_123@test.internflow.com";
  const PASSWORD = "Password123!";

  let studentId: string;
  let companyId: string;
  let internshipId: string;
  let applicationId: string;

  async function cleanup() {
    const testEmails = [STUDENT_EMAIL, COMPANY_EMAIL];
    const users = await prisma.user.findMany({
      where: { email: { in: testEmails } },
    });

    for (const u of users) {
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

    // Create student
    const studentUser = await prisma.user.create({
      data: {
        name: "Application Student",
        email: STUDENT_EMAIL,
        password: PASSWORD,
        role: "STUDENT",
      },
    });
    const student = await prisma.studentProfile.create({
      data: {
        userId: studentUser.id,
        university: "Application University",
        major: "Computer Science",
        skills: ["React", "TypeScript"],
      },
    });
    studentId = student.id;

    // Create company
    const companyUser = await prisma.user.create({
      data: {
        name: "Application Company Owner",
        email: COMPANY_EMAIL,
        password: PASSWORD,
        role: "COMPANY",
      },
    });
    const company = await prisma.company.create({
      data: {
        userId: companyUser.id,
        name: "Application Tech Inc.",
        description: "Innovative tech solutions",
        approved: true,
      },
    });
    companyId = company.id;

    // Create internship
    const internship = await prisma.internship.create({
      data: {
        title: "Frontend Intern",
        description: "Looking for React developer.",
        location: "Remote",
        type: "Remote",
        companyId: companyId,
      },
    });
    internshipId = internship.id;
  });

  afterAll(async () => {
    await cleanup();
  });

  it("should successfully apply to an internship", async () => {
    const result = await applyToInternship(studentId, internshipId);
    expect(result.code).toBe(201);
    expect(result.data).toBeDefined();
    expect(result.data?.studentId).toBe(studentId);
    expect(result.data?.internshipId).toBe(internshipId);
    expect(result.data?.status).toBe("PENDING");
    applicationId = result.data!.id;
  });

  it("should prevent duplicate applications", async () => {
    const result = await applyToInternship(studentId, internshipId);
    expect(result.code).toBe(400);
    expect(result.error).toContain("already applied");
  });

  it("should successfully retrieve student application history", async () => {
    const history = await getStudentApplications(studentId);
    expect(history.length).toBe(1);
    expect(history[0].internshipId).toBe(internshipId);
    expect(history[0].internship.company.name).toBe("Application Tech Inc.");
  });

  it("should successfully retrieve applicants for an internship (authorized company)", async () => {
    const result = await getApplicantsForInternship(internshipId, companyId);
    expect(result.code).toBe(200);
    expect(result.data).toBeDefined();
    expect(result.data?.length).toBe(1);
    expect(result.data?.[0].studentId).toBe(studentId);
  });

  it("should prevent retrieving applicants for an unauthorized company", async () => {
    const result = await getApplicantsForInternship(internshipId, "some-other-company-id");
    expect(result.code).toBe(403);
    expect(result.error).toContain("permission");
  });

  it("should successfully update application status (authorized company)", async () => {
    const result = await updateApplicationStatus(applicationId, companyId, "ACCEPTED");
    expect(result.code).toBe(200);
    expect(result.data).toBeDefined();
    expect(result.data?.status).toBe("ACCEPTED");
  });

  it("should prevent updating application status for unauthorized company", async () => {
    const result = await updateApplicationStatus(applicationId, "some-other-company-id", "REJECTED");
    expect(result.code).toBe(403);
    expect(result.error).toContain("permission");
  });
});
