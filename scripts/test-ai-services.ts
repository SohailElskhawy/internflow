import "dotenv/config";
import { prisma } from "@/lib/db";
import { analyzeStudentResume, getStudentResumeAnalysis } from "@/lib/services/resume.service";
import { calculateOrGetJobMatch, getRankedApplicantsForInternship } from "@/lib/services/matching.service";
import { generateOrGetInterviewPrep } from "@/lib/services/interview-prep.service";
import { generateCoverLetter } from "@/lib/services/cover-letter.service";
import { askCareerAdvisor } from "@/lib/services/career-advisor.service";
import { getCompanyAiInsights } from "@/lib/services/ai-insights.service";

async function main() {
  console.log("=========================================");
  console.log("🚀 STARTING BACKEND AI SERVICES TEST SCRIPT");
  console.log("=========================================");

  // Define unique test identifiers
  const STUDENT_EMAIL = "ai_test_student@internflow.com";
  const COMPANY_EMAIL = "ai_test_company@internflow.com";

  let testStudentUser: any = null;
  let testStudentProfile: any = null;
  let testCompanyUser: any = null;
  let testCompany: any = null;
  let testInternship: any = null;
  let testApplication: any = null;

  try {
    // ----------------------------------------------------
    // CLEANUP EXISTING TEST DATA (In case of previous failure)
    // ----------------------------------------------------
    console.log("🧹 Checking and cleaning up any stale test records...");
    const existingUsers = await prisma.user.findMany({
      where: {
        email: { in: [STUDENT_EMAIL, COMPANY_EMAIL] }
      }
    });

    for (const u of existingUsers) {
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
    console.log("✅ Stale test records cleaned.");

    // ----------------------------------------------------
    // SEED TEST DATA
    // ----------------------------------------------------
    console.log("\n🌱 Seeding test database records...");

    // Create student user
    testStudentUser = await prisma.user.create({
      data: {
        name: "Test AI Student",
        email: STUDENT_EMAIL,
        password: "hashedpassword123", // Dummy password
        role: "STUDENT",
      }
    });
    console.log(`- Created Student User ID: ${testStudentUser.id}`);

    // Create student profile
    testStudentProfile = await prisma.studentProfile.create({
      data: {
        userId: testStudentUser.id,
        university: "University of AI Testing",
        major: "Computer Science",
        skills: ["TypeScript", "Node.js", "React"],
      }
    });
    console.log(`- Created Student Profile ID: ${testStudentProfile.id}`);

    // Create company user
    testCompanyUser = await prisma.user.create({
      data: {
        name: "Test AI Company Owner",
        email: COMPANY_EMAIL,
        password: "hashedpassword123",
        role: "COMPANY",
      }
    });
    console.log(`- Created Company User ID: ${testCompanyUser.id}`);

    // Create company profile
    testCompany = await prisma.company.create({
      data: {
        userId: testCompanyUser.id,
        name: "Test AI Tech Inc.",
        description: "A high tech company specializing in AI testing.",
        approved: true,
      }
    });
    console.log(`- Created Company ID: ${testCompany.id}`);

    // Create internship posting
    testInternship = await prisma.internship.create({
      data: {
        title: "Software Engineering Intern (AI & Web)",
        description: "Looking for an intern skilled in TypeScript, React, PostgreSQL, and basic understanding of Docker containerization.",
        location: "San Francisco, CA",
        type: "Remote",
        companyId: testCompany.id,
      }
    });
    console.log(`- Created Internship ID: ${testInternship.id}`);

    // Create application
    testApplication = await prisma.application.create({
      data: {
        studentId: testStudentProfile.id,
        internshipId: testInternship.id,
        status: "PENDING",
      }
    });
    console.log(`- Created Application ID: ${testApplication.id}`);

    // ----------------------------------------------------
    // 1. TEST RESUME ANALYSIS SERVICE
    // ----------------------------------------------------
    console.log("\n📝 1. Testing Resume Analysis Service...");
    const sampleResumeText = `
      John Doe
      email: john.doe@example.com
      Skills: JavaScript, TypeScript, React, Node.js, Express, PostgreSQL, Git
      Education: B.S. in Computer Science at University of AI Testing, 2026
      Experience:
      - Frontend Developer Intern at WebDev Corp (Summer 2025): Developed features using React and Tailwind CSS. Managed state with Redux.
      - Personal Projects: Built a full-stack job board using Next.js, Prisma, and PostgreSQL.
    `.trim();

    const analysis = await analyzeStudentResume(testStudentProfile.id, sampleResumeText);
    console.log("✨ Resume analysis saved successfully.");
    console.log("- Summary:", analysis.summary);
    console.log("- Strengths:", JSON.stringify(analysis.strengths));
    console.log("- Weaknesses:", JSON.stringify(analysis.weaknesses));
    console.log("- Suggested Roles:", JSON.stringify(analysis.suggestedRoles));

    // Verify retrieval works
    const retrievedAnalysis = await getStudentResumeAnalysis(testStudentProfile.id);
    if (!retrievedAnalysis) {
      throw new Error("Failed to retrieve resume analysis after saving!");
    }
    console.log("✅ Resume Analysis GET retrieval works.");

    // ----------------------------------------------------
    // 2. TEST JOB MATCHING SERVICE
    // ----------------------------------------------------
    console.log("\n📊 2. Testing Job Matching Service...");
    const matchResult = await calculateOrGetJobMatch(testStudentProfile.id, testInternship.id);
    console.log("✨ Job match result computed and saved:");
    console.log(`- Match Score: ${matchResult.matchScore}%`);
    console.log("- Summary:", matchResult.summary);
    console.log("- Matching Skills:", JSON.stringify(matchResult.matchingSkills));
    console.log("- Missing Skills:", JSON.stringify(matchResult.missingSkills));
    console.log("- Recruiter Takeaway:", matchResult.recruiterTakeaway);
    console.log("✅ Job Matching Service works.");

    // ----------------------------------------------------
    // 3. TEST INTERVIEW PREPARATION KIT SERVICE
    // ----------------------------------------------------
    console.log("\n🎙️ 3. Testing Interview Prep Service...");
    const prepKit = await generateOrGetInterviewPrep(testStudentProfile.id, testInternship.id);
    console.log("✨ Interview Prep Kit generated and saved:");
    console.log(`- Technical Questions generated: ${(prepKit.technicalQuestions as any[]).length}`);
    console.log(`- Behavioral Questions generated: ${(prepKit.behavioralQuestions as any[]).length}`);
    console.log(`- Study Topics generated: ${(prepKit.studyTopics as any[]).length}`);
    console.log("- Sample Technical Q:", (prepKit.technicalQuestions as any[])[0]?.question);
    console.log("- Sample Behavioral Q:", (prepKit.behavioralQuestions as any[])[0]?.question);
    console.log("✅ Interview Prep Service works.");

    // ----------------------------------------------------
    // 4. TEST COVER LETTER SERVICE
    // ----------------------------------------------------
    console.log("\n✉️ 4. Testing Cover Letter Service...");
    const coverLetterData = await generateCoverLetter(
      testStudentProfile.id,
      testInternship.id,
      "I am very passionate about learning cloud services and Docker containerization."
    );
    console.log("✨ Cover letter generated:");
    console.log("- Highlights:", JSON.stringify(coverLetterData.highlights));
    console.log("- Cover Letter Preview:\n", coverLetterData.coverLetter.substring(0, 300) + "...\n");
    console.log("✅ Cover Letter Service works.");

    // ----------------------------------------------------
    // 5. TEST CAREER ADVISOR SERVICE
    // ----------------------------------------------------
    console.log("\n💬 5. Testing Career Advisor Service...");
    const chatResult = await askCareerAdvisor(
      testStudentProfile.id,
      "What are the best practices for using JWT authentication in Next.js?"
    );
    console.log("✨ Career Advisor chat reply received:");
    console.log("- Reply Preview:\n", chatResult.reply.substring(0, 300) + "...\n");
    console.log("- Suggested Next Questions:", JSON.stringify(chatResult.suggestedNextQuestions));
    console.log("✅ Career Advisor Service works.");

    // ----------------------------------------------------
    // 6. TEST COMPANY INSIGHTS SERVICE
    // ----------------------------------------------------
    console.log("\n📈 6. Testing Company AI Insights Service...");
    const insights = await getCompanyAiInsights(testCompany.id);
    console.log("✨ Company AI Dashboard Insights retrieved:");
    console.log("- Total Applicants Analyzed:", insights.totalApplicantsAnalyzed);
    console.log("- Average Match Score:", insights.averageMatchScore);
    console.log("- Top Skills in Applicant Pool:", JSON.stringify(insights.topSkills));
    console.log("- Missing Skill Gaps identified:", JSON.stringify(insights.missingSkillGaps));
    console.log("✅ Company AI Insights Service works.");

    // ----------------------------------------------------
    // 7. TEST RANKED APPLICANTS SERVICE
    // ----------------------------------------------------
    console.log("\n🏆 7. Testing Ranked Applicants Service...");
    const rankedApplicants = await getRankedApplicantsForInternship(testCompany.id, testInternship.id);
    console.log("✨ Ranked Applicants retrieved:");
    console.log(`- Total applicants ranked: ${rankedApplicants.length}`);
    console.log("- Rank 1 Applicant Name:", rankedApplicants[0]?.studentName);
    console.log("- Rank 1 Match Score:", rankedApplicants[0]?.matchScore);
    console.log("✅ Ranked Applicants Service works.");

    console.log("\n🎉 ALL AI BACKEND SERVICES TESTS PASSED SUCCESSFULLY! 🎉");

  } catch (error) {
    console.error("\n❌ TEST FAILURE:", error);
    process.exitCode = 1;
  } finally {
    // ----------------------------------------------------
    // CLEANUP DATABASE
    // ----------------------------------------------------
    console.log("\n🧹 Cleaning up test records from database...");
    try {
      if (testApplication) {
        await prisma.application.delete({ where: { id: testApplication.id } });
        console.log("- Deleted test application");
      }
      if (testInternship) {
        // Cascade delete will delete associated JobMatchResult, InterviewPrep, etc.
        await prisma.jobMatchResult.deleteMany({ where: { internshipId: testInternship.id } });
        await prisma.interviewPrep.deleteMany({ where: { internshipId: testInternship.id } });
        await prisma.internship.delete({ where: { id: testInternship.id } });
        console.log("- Deleted test internship");
      }
      if (testStudentProfile) {
        await prisma.resumeAnalysis.deleteMany({ where: { studentId: testStudentProfile.id } });
        await prisma.studentProfile.delete({ where: { id: testStudentProfile.id } });
        console.log("- Deleted test student profile");
      }
      if (testCompany) {
        await prisma.company.delete({ where: { id: testCompany.id } });
        console.log("- Deleted test company");
      }
      if (testStudentUser) {
        await prisma.user.delete({ where: { id: testStudentUser.id } });
        console.log("- Deleted test student user");
      }
      if (testCompanyUser) {
        await prisma.user.delete({ where: { id: testCompanyUser.id } });
        console.log("- Deleted test company user");
      }
      console.log("✅ Cleanup complete.");
    } catch (cleanupErr) {
      console.error("⚠️ Cleanup failed:", cleanupErr);
    }
  }
}

main();
