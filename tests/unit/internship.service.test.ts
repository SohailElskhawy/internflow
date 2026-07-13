import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createInternship,
  getAllInternships,
  getInternshipById,
  updateInternship,
  deleteInternship,
  getPopularInternships,
} from "@/lib/services/internship.service";
import { prisma } from "@/lib/db";

describe("Internship Service Tests", () => {
  const OWNER_EMAIL = "internship_test_owner_123@test.internflow.com";
  const PASSWORD = "Password123!";
  let companyId: string;
  let userId: string;
  let testInternshipId: string;

  async function cleanup() {
    const owner = await prisma.user.findFirst({
      where: { email: OWNER_EMAIL },
      include: { company: true },
    });

    if (owner) {
      if (owner.company) {
        const internships = await prisma.internship.findMany({ where: { companyId: owner.company.id } });
        const internshipIds = internships.map((i) => i.id);
        await prisma.application.deleteMany({ where: { internshipId: { in: internshipIds } } });
        await prisma.jobMatchResult.deleteMany({ where: { internshipId: { in: internshipIds } } });
        await prisma.interviewPrep.deleteMany({ where: { internshipId: { in: internshipIds } } });
        await prisma.internship.deleteMany({ where: { companyId: owner.company.id } });
        await prisma.company.delete({ where: { id: owner.company.id } });
      }
      await prisma.user.delete({ where: { id: owner.id } });
    }
  }

  beforeAll(async () => {
    await cleanup();

    // Create a test company user and company profile
    const user = await prisma.user.create({
      data: {
        name: "Test Internship Company Owner",
        email: OWNER_EMAIL,
        password: PASSWORD,
        role: "COMPANY",
      },
    });
    userId = user.id;

    const company = await prisma.company.create({
      data: {
        userId: user.id,
        name: "Test Internship Company",
        description: "Company description",
        approved: true,
      },
    });
    companyId = company.id;
  });

  afterAll(async () => {
    await cleanup();
  });

  it("should successfully create a new internship posting", async () => {
    const internship = await createInternship(companyId, {
      title: "Backend Engineer Intern (Node.js)",
      description: "Looking for an intern skilled in Node.js and REST APIs.",
      location: "Remote",
      type: "Remote",
    });

    expect(internship).toBeDefined();
    expect(internship.id).toBeDefined();
    expect(internship.title).toBe("Backend Engineer Intern (Node.js)");
    expect(internship.companyId).toBe(companyId);
    testInternshipId = internship.id;
  });

  it("should successfully retrieve all internships with filters", async () => {
    const { internships, total } = await getAllInternships("Backend", "Remote");
    expect(internships.length).toBeGreaterThanOrEqual(1);
    expect(total).toBeGreaterThanOrEqual(1);
    expect(internships[0].title).toContain("Backend");
  });

  it("should successfully retrieve popular internships", async () => {
    const popular = await getPopularInternships(2);
    expect(popular).toBeDefined();
    expect(popular.length).toBeLessThanOrEqual(2);
  });

  it("should successfully retrieve an internship by ID", async () => {
    const internship = await getInternshipById(testInternshipId);
    expect(internship).toBeDefined();
    expect(internship?.id).toBe(testInternshipId);
    expect(internship?.company.name).toBe("Test Internship Company");
  });

  it("should successfully update an internship posting", async () => {
    const result = await updateInternship(testInternshipId, companyId, {
      title: "Updated Backend Engineer Intern",
      location: "San Francisco, CA",
    });

    expect(result.code).toBe(200);
    expect(result.data?.title).toBe("Updated Backend Engineer Intern");
    expect(result.data?.location).toBe("San Francisco, CA");
  });

  it("should prevent updating an internship posting by an unauthorized company", async () => {
    const result = await updateInternship(testInternshipId, "some-other-company-id", {
      title: "Hack attempt",
    });

    expect(result.code).toBe(403);
    expect(result.error).toContain("Unauthorized");
  });

  it("should prevent deleting an internship posting by an unauthorized company", async () => {
    const result = await deleteInternship(testInternshipId, "some-other-company-id");
    expect(result.code).toBe(403);
    expect(result.error).toContain("Unauthorized");
  });

  it("should successfully delete an internship posting", async () => {
    const result = await deleteInternship(testInternshipId, companyId);
    expect(result.code).toBe(200);
    expect(result.data).toBe(true);

    const deleted = await getInternshipById(testInternshipId);
    expect(deleted).toBeNull();
  });
});
