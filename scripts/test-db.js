const { PrismaClient } = require("@prisma/client");
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
require("dotenv").config();

async function main() {
  console.log("Database URL:", process.env.DATABASE_URL);
  
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log("Connecting to database and checking tables...");
    
    // Check if we can query users
    const userCount = await prisma.user.count();
    console.log("Successfully connected. User count:", userCount);
    
    // Check StudentProfile
    const studentCount = await prisma.studentProfile.count();
    console.log("StudentProfile count:", studentCount);

    // Try to check ResumeAnalysis
    try {
      const resumeAnalysisCount = await prisma.resumeAnalysis.count();
      console.log("ResumeAnalysis table exists. Count:", resumeAnalysisCount);
    } catch (err) {
      console.error("ResumeAnalysis table query failed:", err.message);
    }

    // Try to check JobMatchResult
    try {
      const jobMatchResultCount = await prisma.jobMatchResult.count();
      console.log("JobMatchResult table exists. Count:", jobMatchResultCount);
    } catch (err) {
      console.error("JobMatchResult table query failed:", err.message);
    }

    // Try to check InterviewPrep
    try {
      const interviewPrepCount = await prisma.interviewPrep.count();
      console.log("InterviewPrep table exists. Count:", interviewPrepCount);
    } catch (err) {
      console.error("InterviewPrep table query failed:", err.message);
    }

  } catch (error) {
    console.error("Connection or general query failed:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
