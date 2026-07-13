const { PrismaClient } = require("@prisma/client");
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function main() {
  console.log("Database URL:", process.env.DATABASE_URL);
  
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log("Cleaning up existing database records...");

    // Delete child records first to respect foreign keys
    await prisma.application.deleteMany();
    console.log("Deleted applications.");

    await prisma.jobMatchResult.deleteMany();
    console.log("Deleted job match results.");

    await prisma.interviewPrep.deleteMany();
    console.log("Deleted interview preps.");

    await prisma.resumeAnalysis.deleteMany();
    console.log("Deleted resume analyses.");

    await prisma.notification.deleteMany();
    console.log("Deleted notifications.");

    await prisma.notificationPreference.deleteMany();
    console.log("Deleted notification preferences.");

    await prisma.activityLog.deleteMany();
    console.log("Deleted activity logs.");

    await prisma.internship.deleteMany();
    console.log("Deleted internships.");

    await prisma.company.deleteMany();
    console.log("Deleted companies.");

    await prisma.studentProfile.deleteMany();
    console.log("Deleted student profiles.");

    await prisma.user.deleteMany();
    console.log("Deleted users.");

    console.log("Hashing passwords...");
    const hashedPassword = await bcrypt.hash("password123", 10);

    console.log("Seeding student users and profiles...");
    const student1User = await prisma.user.create({
      data: {
        name: "Jane Doe",
        email: "jane@example.com",
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

    const student1Profile = await prisma.studentProfile.create({
      data: {
        userId: student1User.id,
        university: "Stanford University",
        major: "Computer Science",
        skills: ["React", "TypeScript", "Node.js", "Python", "SQL"],
      }
    });

    const student2User = await prisma.user.create({
      data: {
        name: "John Smith",
        email: "john@example.com",
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

    const student2Profile = await prisma.studentProfile.create({
      data: {
        userId: student2User.id,
        university: "MIT",
        major: "Electrical Engineering",
        skills: ["C++", "Python", "Embedded Systems", "MATLAB"],
      }
    });

    const student3User = await prisma.user.create({
      data: {
        name: "Alice Johnson",
        email: "alice@example.com",
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

    const student3Profile = await prisma.studentProfile.create({
      data: {
        userId: student3User.id,
        university: "NYU",
        major: "Graphic Design",
        skills: ["Figma", "Adobe Illustrator", "UI/UX", "CSS"],
      }
    });

    console.log("Seeding company users and profiles...");
    const company1User = await prisma.user.create({
      data: {
        name: "TechCorp Recruiter",
        email: "techcorp@example.com",
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

    const company1Profile = await prisma.company.create({
      data: {
        userId: company1User.id,
        name: "TechCorp",
        description: "A leading provider of enterprise technology solutions. We build software that powers the world's largest companies.",
        approved: true,
      }
    });

    const company2User = await prisma.user.create({
      data: {
        name: "DesignHub HR",
        email: "designhub@example.com",
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

    const company2Profile = await prisma.company.create({
      data: {
        userId: company2User.id,
        name: "DesignHub",
        description: "Boutique creative agency specializing in branding, web design, and digital experiences.",
        approved: true,
      }
    });

    const company3User = await prisma.user.create({
      data: {
        name: "FinanceFlows Hiring",
        email: "financeflows@example.com",
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

    const company3Profile = await prisma.company.create({
      data: {
        userId: company3User.id,
        name: "FinanceFlows",
        description: "Innovative fintech startup disrupting traditional payment networks with decentralized technologies.",
        approved: true,
      }
    });

    console.log("Seeding internships...");
    const internship1 = await prisma.internship.create({
      data: {
        companyId: company1Profile.id,
        title: "Software Engineering Intern",
        type: "Remote",
        location: "San Francisco, CA",
        description: "Join TechCorp as a Software Engineering Intern. You will work alongside senior software engineers on our core cloud platforms, building microservices in Node.js and React, and developing high-performance REST APIs.",
      }
    });

    const internship2 = await prisma.internship.create({
      data: {
        companyId: company1Profile.id,
        title: "DevOps Intern",
        type: "Hybrid",
        location: "Seattle, WA",
        description: "TechCorp is looking for a DevOps Intern to help automate our CI/CD pipelines, manage Kubernetes clusters in AWS, and improve system reliability. Experience with Docker, bash scripting, and Linux is highly valued.",
      }
    });

    const internship3 = await prisma.internship.create({
      data: {
        companyId: company2Profile.id,
        title: "UI/UX Design Intern",
        type: "Hybrid",
        location: "New York, NY",
        description: "DesignHub is hiring a UI/UX Design Intern. You will help design user flows, wireframes, high-fidelity prototypes in Figma, and conduct user research for clients ranging from startups to fortune 500 companies.",
      }
    });

    const internship4 = await prisma.internship.create({
      data: {
        companyId: company2Profile.id,
        title: "Graphic Design Intern",
        type: "Remote",
        location: "Los Angeles, CA",
        description: "DesignHub creative studio is looking for a Graphic Design Intern. Create stunning visual assets, logos, and illustration work. Build modern presentations and digital mockups.",
      }
    });

    const internship5 = await prisma.internship.create({
      data: {
        companyId: company3Profile.id,
        title: "Financial Analyst Intern",
        type: "Full-time",
        location: "San Francisco, CA",
        description: "FinanceFlows is hiring a Financial Analyst Intern. Prepare daily trading models, assist in quarterly forecasting, and build automated financial dashboards using Excel, SQL, and Python.",
      }
    });

    const internship6 = await prisma.internship.create({
      data: {
        companyId: company3Profile.id,
        title: "Quantitative Research Intern",
        type: "Remote",
        location: "Chicago, IL",
        description: "FinanceFlows research lab is looking for a Quantitative Research Intern. Work on algorithmic trading strategies, backtest historical datasets, and optimize portfolio constraints. Heavy mathematics/statistical physics focus.",
      }
    });

    console.log("Seeding application records...");
    await prisma.application.create({
      data: {
        studentId: student1Profile.id,
        internshipId: internship1.id,
        status: "PENDING",
      }
    });

    await prisma.application.create({
      data: {
        studentId: student2Profile.id,
        internshipId: internship2.id,
        status: "ACCEPTED",
      }
    });

    await prisma.application.create({
      data: {
        studentId: student3Profile.id,
        internshipId: internship3.id,
        status: "REJECTED",
      }
    });

    await prisma.application.create({
      data: {
        studentId: student1Profile.id,
        internshipId: internship6.id,
        status: "ACCEPTED",
      }
    });

    console.log("Database successfully seeded with mock data!");
    console.log("\nSample Accounts to use (Password is 'password123'):");
    console.log("-------------------------------------------------");
    console.log(`Student:   jane@example.com  - ${student1User.name}`);
    console.log(`Student:   john@example.com  - ${student2User.name}`);
    console.log(`Student:   alice@example.com - ${student3User.name}`);
    console.log(`Company:   techcorp@example.com`);
    console.log(`Company:   designhub@example.com`);
    console.log(`Company:   financeflows@example.com`);

  } catch (error) {
    console.error("Error during database seeding:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
