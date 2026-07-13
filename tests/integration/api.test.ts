import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { POST as registerHandler } from "@/app/api/auth/register/route";
import { POST as loginHandler } from "@/app/api/auth/login/route";
import { POST as createInternshipHandler } from "@/app/api/internships/route";
import { POST as applyHandler } from "@/app/api/students/apply/[id]/route";
import { PATCH as updateStatusHandler } from "@/app/api/applications/[id]/status/route";
import { GET as getApplicationsHandler } from "@/app/api/students/applications/route";
import { prisma } from "@/lib/db";

// Global mock state for request cookies
let mockCookieStore: Record<string, string> = {};

vi.mock("next/headers", () => {
  return {
    cookies: () => {
      return {
        get: (name: string) => {
          const val = mockCookieStore[name];
          return val ? { name, value: val } : undefined;
        },
        set: (name: string, value: string) => {
          mockCookieStore[name] = value;
        },
        delete: (name: string) => {
          delete mockCookieStore[name];
        },
      };
    },
  };
});

describe("API Integration Flow Tests", () => {
  const STUDENT_EMAIL = "api_flow_student@test.internflow.com";
  const COMPANY_EMAIL = "api_flow_company@test.internflow.com";
  const PASSWORD = "Password123!";

  let studentToken = "";
  let companyToken = "";
  let internshipId = "";
  let applicationId = "";

  async function cleanup() {
    mockCookieStore = {};
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
  });

  afterAll(async () => {
    await cleanup();
  });

  it("1. Register Student", async () => {
    const req = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Flow Student",
        email: STUDENT_EMAIL,
        password: PASSWORD,
        confirmPassword: PASSWORD,
        role: "STUDENT",
      }),
    });

    const res = await registerHandler(req);
    expect(res.status).toBe(201);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.token).toBeDefined();
    studentToken = json.data.token;
  });

  it("2. Register Company", async () => {
    const req = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Flow Company",
        email: COMPANY_EMAIL,
        password: PASSWORD,
        confirmPassword: PASSWORD,
        role: "COMPANY",
      }),
    });

    const res = await registerHandler(req);
    expect(res.status).toBe(201);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.token).toBeDefined();
    companyToken = json.data.token;
  });

  it("3. Login as Company Owner", async () => {
    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: COMPANY_EMAIL,
        password: PASSWORD,
      }),
    });

    const res = await loginHandler(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.token).toBeDefined();
    // Update companyToken to the newly acquired token
    companyToken = json.data.token;
  });

  it("4. Create Internship (Company Posting)", async () => {
    // Authenticate the request using company token
    mockCookieStore["token"] = companyToken;

    const req = new Request("http://localhost/api/internships", {
      method: "POST",
      body: JSON.stringify({
        title: "Flow Intern Position",
        description: "Must know integration testing.",
        location: "Hybrid",
        type: "Hybrid",
      }),
    });

    const res = await createInternshipHandler(req);
    expect(res.status).toBe(201);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.id).toBeDefined();
    internshipId = json.data.id;
  });

  it("5. Student Applies to Internship", async () => {
    // Authenticate the request using student token
    mockCookieStore["token"] = studentToken;

    const req = new Request(`http://localhost/api/students/apply/${internshipId}`, {
      method: "POST",
    });

    const res = await applyHandler(req, {
      params: Promise.resolve({ id: internshipId }),
    });
    expect(res.status).toBe(201);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.id).toBeDefined();
    applicationId = json.data.id;
  });

  it("6. Company Accepts Application", async () => {
    // Authenticate the request using company token
    mockCookieStore["token"] = companyToken;

    const req = new Request(`http://localhost/api/applications/${applicationId}/status`, {
      method: "PATCH",
      body: JSON.stringify({
        status: "ACCEPTED",
      }),
    });

    const res = await updateStatusHandler(req, {
      params: Promise.resolve({ id: applicationId }),
    });
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.status).toBe("ACCEPTED");
  });

  it("7. Student Verifies Application Status is ACCEPTED", async () => {
    // Authenticate the request using student token
    mockCookieStore["token"] = studentToken;

    const res = await getApplicationsHandler();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.length).toBe(1);
    expect(json.data[0].id).toBe(applicationId);
    expect(json.data[0].status).toBe("ACCEPTED");
  });
});
