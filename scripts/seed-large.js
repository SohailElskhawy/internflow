const { PrismaClient } = require("@prisma/client");
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const UNIVERSITIES = [
  "Stanford University", "MIT", "UC Berkeley", "Harvard University", "NYU",
  "Carnegie Mellon University", "Georgia Tech", "University of Michigan", "UCLA", "University of Washington"
];

const MAJORS = [
  "Computer Science", "Software Engineering", "Data Science", "Information Technology",
  "Electrical Engineering", "Mechanical Engineering", "Business Administration", "Graphic Design"
];

const SKILLS_LIST = [
  "React", "TypeScript", "Node.js", "Python", "SQL", "C++", "Java", "Go", "Docker", "Kubernetes",
  "AWS", "Git", "Figma", "HTML", "CSS", "Next.js", "Tailwind CSS", "Prisma", "PostgreSQL", "NoSQL"
];

const COMPANY_NAMES = [
  "Apex Dynamics", "BlueHorizon Tech", "CloudSphere", "DeltaAI", "EchoMedia",
  "FinFlow Systems", "GreenGrid Energy", "HyperScale", "IntellectLab", "Jovian Software",
  "Krypton Security", "Lumen Design", "Matrix Data", "Nova Capital", "OmniTech Corp"
];

const JOB_TITLES = [
  "Software Engineering Intern", "Frontend Developer Intern", "Backend Engineer Intern",
  "Fullstack Developer Intern", "Data Science Intern", "Machine Learning Intern",
  "Product Management Intern", "UI/UX Design Intern", "Mobile App Developer Intern",
  "DevOps Engineer Intern", "Cloud Infrastructure Intern", "Cybersecurity Analyst Intern",
  "Database Administrator Intern", "Quality Assurance Intern", "Systems Analyst Intern",
  "Technical Writer Intern"
];

const LOCATIONS = [
  "San Francisco, CA", "New York, NY", "Seattle, WA", "Austin, TX", "Boston, MA",
  "Chicago, IL", "Denver, CO", "Los Angeles, CA", "Remote", "Remote (US)", "Hybrid (New York)", "Hybrid (San Francisco)"
];

const TYPES = ["Full-time", "Part-time", "Remote", "Hybrid"];

async function main() {
  console.log("Seeding large database...");
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    // 1. Clean existing records
    console.log("Cleaning up existing database records...");
    await prisma.application.deleteMany();
    await prisma.jobMatchResult.deleteMany();
    await prisma.interviewPrep.deleteMany();
    await prisma.resumeAnalysis.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.notificationPreference.deleteMany();
    await prisma.activityLog.deleteMany();
    await prisma.internship.deleteMany();
    await prisma.company.deleteMany();
    await prisma.studentProfile.deleteMany();
    await prisma.user.deleteMany();
    console.log("Clean up finished.");

    // 2. Hash passwords
    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash("password123", 10);

    // 3. Create 50 Students
    console.log("Creating 50 students...");
    const studentProfiles = [];
    for (let i = 1; i <= 50; i++) {
      const name = `Student ${i}`;
      const email = `student${i}@example.com`;
      
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "STUDENT",
          notificationPreference: {
            create: {
              emailApplications: true,
              emailInternships: true,
              pushNotifications: true,
            }
          }
        }
      });

      // Pick random university, major, and 4-7 random skills
      const university = UNIVERSITIES[Math.floor(Math.random() * UNIVERSITIES.length)];
      const major = MAJORS[Math.floor(Math.random() * MAJORS.length)];
      const numSkills = 4 + Math.floor(Math.random() * 4);
      const shuffledSkills = [...SKILLS_LIST].sort(() => 0.5 - Math.random());
      const skills = shuffledSkills.slice(0, numSkills);

      const profile = await prisma.studentProfile.create({
        data: {
          userId: user.id,
          university,
          major,
          skills,
        }
      });
      studentProfiles.push(profile);
    }
    console.log(`Created ${studentProfiles.length} student profiles.`);

    // 4. Create 15 Companies
    console.log("Creating 15 companies...");
    const companies = [];
    for (let i = 1; i <= 15; i++) {
      const name = COMPANY_NAMES[i - 1];
      const email = `recruiter@${name.toLowerCase().replace(/\s+/g, "")}.com`;

      const user = await prisma.user.create({
        data: {
          name: `${name} Recruiter`,
          email,
          password: hashedPassword,
          role: "COMPANY",
          notificationPreference: {
            create: {
              emailApplications: true,
              emailInternships: false,
              pushNotifications: true,
            }
          }
        }
      });

      const company = await prisma.company.create({
        data: {
          userId: user.id,
          name,
          description: `${name} is a high-growth company operating in modern technology space, building enterprise solutions and user-centric systems.`,
          approved: true,
        }
      });
      companies.push(company);
    }
    console.log(`Created ${companies.length} companies.`);

    // 5. Create 100 Internships
    console.log("Creating 100 internships...");
    const internships = [];
    for (let i = 1; i <= 100; i++) {
      // Pick random company
      const company = companies[Math.floor(Math.random() * companies.length)];
      const title = `${JOB_TITLES[Math.floor(Math.random() * JOB_TITLES.length)]}`;
      const type = TYPES[Math.floor(Math.random() * TYPES.length)];
      const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
      
      const internship = await prisma.internship.create({
        data: {
          companyId: company.id,
          title,
          type,
          location,
          description: `Exciting opportunity to join ${company.name} as a ${title}. You will get hands-on experience working with modern tech stack, collaborating in agile teams, and solving practical software engineering and design challenges.`,
        }
      });
      internships.push(internship);
    }
    console.log(`Created ${internships.length} internships.`);

    // 6. Create 300 Applications & AI Matches
    console.log("Creating 300 applications...");
    let applicationsCount = 0;
    const existingPairs = new Set();
    const statuses = ["PENDING", "ACCEPTED", "REJECTED"];

    while (applicationsCount < 300) {
      // Random student and internship
      const student = studentProfiles[Math.floor(Math.random() * studentProfiles.length)];
      const internship = internships[Math.floor(Math.random() * internships.length)];
      
      const pairKey = `${student.id}-${internship.id}`;
      if (existingPairs.has(pairKey)) {
        continue;
      }

      existingPairs.add(pairKey);
      
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      // Create Application
      const application = await prisma.application.create({
        data: {
          studentId: student.id,
          internshipId: internship.id,
          status,
        }
      });

      // Create realistic AI match result for the application
      const matchScore = 40 + Math.floor(Math.random() * 55); // 40 to 95
      const matchingSkills = student.skills.filter(() => Math.random() > 0.4);
      const missingSkills = SKILLS_LIST.filter(s => !student.skills.includes(s)).slice(0, 3);
      
      await prisma.jobMatchResult.create({
        data: {
          studentId: student.id,
          internshipId: internship.id,
          matchScore,
          summary: `Candidate profile matches ${matchScore}% of the internship requirements. Demonstrates key competence in ${matchingSkills.join(", ") || "fundamental engineering concepts"}.`,
          matchingSkills,
          missingSkills,
          improvementSuggestions: [
            "Gain hands-on experience with modern cloud tools like AWS and Docker.",
            "Work on a side project demonstrating integration of databases and caching layers.",
            "Develop unit and integration tests to ensure code coverage and robustness."
          ],
          recruiterTakeaway: `Highly motivated candidate with solid university foundation. Match score is ${matchScore}%. Recommended for technical screen.`
        }
      });

      applicationsCount++;
      if (applicationsCount % 50 === 0) {
        console.log(`Created ${applicationsCount} applications and match scores...`);
      }
    }

    console.log("\nDatabase seeding completed successfully!");
    console.log("------------------------------------------");
    console.log(`Students:     50`);
    console.log(`Companies:    15`);
    console.log(`Internships:  100`);
    console.log(`Applications: 300 (with corresponding AI Match results)`);
    console.log("Use password 'password123' for all created accounts.");

  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
