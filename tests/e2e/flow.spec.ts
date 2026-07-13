import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// Load environment variables
dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const STUDENT_EMAIL = "e2e_flow_student@test.internflow.com";
const COMPANY_EMAIL = "e2e_flow_company@test.internflow.com";
const PASSWORD = "Password123!";

test.describe.configure({ mode: "serial" });

test.beforeAll(async () => {
  // Clean up any existing E2E test users
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
});

test.afterAll(async () => {
  await prisma.$disconnect();
  await pool.end();
});

test("E2E Student Apply & Company Accept Flow", async ({ page }) => {
  // Listen for browser logs and network failures
  page.on("console", (msg) => console.log("BROWSER LOG:", msg.text()));
  page.on("pageerror", (err) => console.error("BROWSER ERROR:", err.message));
  page.on("requestfailed", (req) => console.error("REQUEST FAILED:", req.url(), req.failure()?.errorText));

  // --------------------------------------------------------------------
  // 1. REGISTER COMPANY OWNER
  // --------------------------------------------------------------------
  await page.goto("/register");
  await page.locator("#role-company").check();
  await page.locator("#name").fill("E2E Company Corp");
  await page.locator("#email").fill(COMPANY_EMAIL);
  await page.locator("#password").fill(PASSWORD);
  await page.locator("#confirm-password").fill(PASSWORD);
  await page.click('button:has-text("Create account")');

  // Verify redirected to dashboard or home, then navigate to company dashboard
  await page.waitForURL("**/");
  await page.goto("/company/dashboard");

  // Verify Company Name is displayed on the dashboard
  await expect(page.locator("text=Welcome back, E2E Company Corp")).toBeVisible();

  // Create an Internship
  await page.locator("#title").fill("E2E Playwright Intern");
  await page.locator("#description").fill("Looking for an intern to automate testing workflows with Playwright.");
  await page.locator("#location").fill("San Francisco, CA");
  await page.locator("#type").fill("Remote");
  await page.click('button:has-text("Post Internship")');

  // Verify the internship is posted on the dashboard
  await expect(page.locator("text=E2E Playwright Intern")).toBeVisible();

  // Log out
  await page.click("text=Log Out");
  await page.waitForURL("**/");

  // --------------------------------------------------------------------
  // 2. REGISTER STUDENT
  // --------------------------------------------------------------------
  await page.goto("/register");
  await page.locator("#role-student").check();
  await page.locator("#name").fill("E2E Student Name");
  await page.locator("#email").fill(STUDENT_EMAIL);
  await page.locator("#password").fill(PASSWORD);
  await page.locator("#confirm-password").fill(PASSWORD);
  await page.click('button:has-text("Create account")');

  // Wait for redirect to home
  await page.waitForURL("**/");

  // Browse internships
  await page.goto("/internships");
  await expect(page.locator("text=E2E Playwright Intern")).toBeVisible();

  // Navigate to Details page
  const internshipCard = page.locator(".group").filter({ hasText: "E2E Playwright Intern" });
  await internshipCard.locator("text=View Details").click();

  // Verify details page loaded
  await page.waitForURL("**/internships/*");
  await expect(page.locator("text=E2E Playwright Intern")).toBeVisible();

  // Click Apply Now
  await page.click("text=Apply Now");

  // Verify button changes to "Application Submitted"
  await expect(page.locator("text=Application Submitted")).toBeVisible();

  // Navigate to Student Dashboard and verify status is PENDING
  await page.goto("/dashboard");
  await page.click("text=My Applications");
  await page.waitForURL("**/dashboard/applications");
  await expect(page.locator("text=E2E Playwright Intern")).toBeVisible();
  await expect(page.locator("text=PENDING")).toBeVisible();

  // Log out
  await page.click("text=Log Out");
  await page.waitForURL("**/");

  // --------------------------------------------------------------------
  // 3. COMPANY ACCEPTS STUDENT
  // --------------------------------------------------------------------
  await page.goto("/login");
  await page.locator("#email").fill(COMPANY_EMAIL);
  await page.locator("#password").fill(PASSWORD);
  await page.click('button:has-text("Login")');
  await page.waitForURL("**/");

  await page.goto("/company/dashboard");
  await expect(page.locator("text=E2E Playwright Intern")).toBeVisible();

  // Click Manage Applicants for the internship
  const postedInternshipCard = page.locator(".hover\\:shadow-md").filter({ hasText: "E2E Playwright Intern" });
  await postedInternshipCard.locator("text=Manage Applicants").click();

  // Wait for applicants page to load and loader to hide
  await page.waitForURL("**/company/applicants/*");
  await expect(page.locator("text=Loading applicants...")).toBeHidden({ timeout: 15000 });
  await expect(page.locator("text=Applicants for E2E Playwright Intern")).toBeVisible();

  // Verify student name is in applicants list
  await expect(page.locator("text=E2E Student Name")).toBeVisible();

  // Click Accept button on the student's applicant card
  const applicantCard = page.locator(".hover\\:shadow-md").filter({ hasText: "E2E Student Name" });
  await applicantCard.getByRole("button", { name: "Accept" }).click();

  // Wait for Badge to change to Accepted (specifically on the card, not the filter tab)
  await expect(applicantCard.locator(".text-emerald-600:has-text('Accepted')")).toBeVisible();

  // Log out
  await page.click("text=Log Out");
  await page.waitForURL("**/");

  // --------------------------------------------------------------------
  // 4. STUDENT VERIFIES STATUS
  // --------------------------------------------------------------------
  await page.goto("/login");
  await page.locator("#email").fill(STUDENT_EMAIL);
  await page.locator("#password").fill(PASSWORD);
  await page.click('button:has-text("Login")');
  await page.waitForURL("**/");

  await page.goto("/dashboard/applications");
  await page.reload();
  // Wait for applications loader to hide
  await expect(page.locator("text=Loading your applications...")).toBeHidden({ timeout: 15000 });
  await expect(page.locator("text=E2E Playwright Intern")).toBeVisible();
  await expect(page.locator("text=Accepted")).toBeVisible();
});
