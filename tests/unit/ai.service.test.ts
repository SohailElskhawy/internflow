import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { getCompanyAiInsights } from "@/lib/services/ai-insights.service";
import { askCareerAdvisor } from "@/lib/services/career-advisor.service";
import { calculateOrGetJobMatch } from "@/lib/services/matching.service";
import { prisma } from "@/lib/db";

// Mock the Gemini AI client to immediately trigger fallbacks for fast, offline, and deterministic testing.
vi.mock("@/lib/ai/client", () => {
  return {
    generateGeminiJson: vi.fn().mockImplementation(async (prompt, fallbackMockFn) => {
      return fallbackMockFn();
    }),
  };
});

describe("AI Service Tests", () => {
  const STUDENT_EMAIL = "ai_unit_student@test.internflow.com";
  const COMPANY_EMAIL = "ai_unit_company@test.internflow.com";
  const PASSWORD = "Password123!";

  let studentId: string;
  let companyId: string;
  let internshipId: string;

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
        name: "AI Unit Student",
        email: STUDENT_EMAIL,
        password: PASSWORD,
        role: "STUDENT",
      },
    });
    const student = await prisma.studentProfile.create({
      data: {
        userId: studentUser.id,
        university: "University of AI Testing",
        major: "Computer Science",
        skills: ["React", "TypeScript", "Node.js"],
      },
    });
    studentId = student.id;

    // Create company
    const companyUser = await prisma.user.create({
      data: {
        name: "AI Unit Company Owner",
        email: COMPANY_EMAIL,
        password: PASSWORD,
        role: "COMPANY",
      },
    });
    const company = await prisma.company.create({
      data: {
        userId: companyUser.id,
        name: "AI Unit Company",
        description: "Focusing on AI intelligence",
        approved: true,
      },
    });
    companyId = company.id;

    // Create internship
    const internship = await prisma.internship.create({
      data: {
        title: "AI Engineer Intern",
        description: "Looking for an intern skilled in React, Node.js, and TypeScript.",
        location: "Remote",
        type: "Remote",
        companyId: companyId,
      },
    });
    internshipId = internship.id;

    // Create application (needed for company insights match results)
    await prisma.application.create({
      data: {
        studentId: studentId,
        internshipId: internshipId,
        status: "PENDING",
      },
    });
  });

  afterAll(async () => {
    await cleanup();
  });

  it("should successfully calculate job match score using the fallback mock implementation", async () => {
    const match = await calculateOrGetJobMatch(studentId, internshipId);
    expect(match).toBeDefined();
    expect(match.matchScore).toBeGreaterThanOrEqual(65);
    expect(match.matchScore).toBeLessThanOrEqual(95);
    expect(match.studentId).toBe(studentId);
    expect(match.internshipId).toBe(internshipId);
    expect(match.summary).toBeDefined();
  });

  it("should retrieve aggregated AI insights for the company", async () => {
    const insights = await getCompanyAiInsights(companyId);
    expect(insights).toBeDefined();
    expect(insights.totalApplicantsAnalyzed).toBe(1);
    expect(insights.averageMatchScore).toBeGreaterThan(0);
    expect(insights.topSkills.length).toBeGreaterThan(0);
  });

  it("should successfully ask the Career Advisor and return a chat response", async () => {
    const response = await askCareerAdvisor(studentId, "What are the best practices for using JWT authentication?");
    expect(response).toBeDefined();
    expect(response.reply).toContain("JWT");
    expect(response.suggestedNextQuestions.length).toBeGreaterThan(0);
  });
});
