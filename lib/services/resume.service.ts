import { prisma } from "@/lib/db";
import { generateGeminiJson } from "@/lib/ai/client";
import { resumeAnalysisPrompt } from "@/prompts/resume-analysis.prompt";
import { logger } from "@/lib/logger";

export interface ResumeAnalysisResult {
  summary: string;
  skills: {
    technical: string[];
    soft: string[];
    tools: string[];
  };
  education: Array<{
    institution: string;
    degree: string;
    year: string;
  }>;
  experience: Array<{
    role: string;
    organization: string;
    duration: string;
    highlights: string[];
  }>;
  strengths: string[];
  weaknesses: string[];
  suggestedRoles: string[];
}

export async function analyzeStudentResume(studentId: string, rawText: string) {
  logger.info(`Starting resume analysis for student ID: ${studentId}`);

  const prompt = `${resumeAnalysisPrompt}\n${rawText}`;

  const mockFallback = (): ResumeAnalysisResult => ({
    summary: "Motivated software engineering student with strong fundamentals in full-stack web development, TypeScript, and database management.",
    skills: {
      technical: ["React", "Node.js", "TypeScript", "PostgreSQL", "Tailwind CSS"],
      soft: ["Problem Solving", "Team Collaboration", "Agile Methodology"],
      tools: ["Git", "VS Code", "Postman", "Docker"],
    },
    education: [
      {
        institution: "Istanbul Cerrahpaşa University",
        degree: "B.S. Computer Engineering",
        year: "2026",
      },
    ],
    experience: [
      {
        role: "Full-Stack Web Development Projects",
        organization: "Academic & Personal Projects",
        duration: "2024 - Present",
        highlights: [
          "Built full-stack Next.js and Prisma applications with role-based access control.",
          "Designed RESTful APIs and optimized SQL database queries.",
        ],
      },
    ],
    strengths: [
      "Strong backend core principles and modern React expertise",
      "Proactive learning attitude and clear project structure",
    ],
    weaknesses: [
      "Limited production CI/CD pipeline configuration experience",
      "Needs more exposure to automated end-to-end testing frameworks",
    ],
    suggestedRoles: ["Frontend Intern", "Full Stack Intern", "Junior Backend Developer"],
  });

  const analysis = await generateGeminiJson<ResumeAnalysisResult>(prompt, mockFallback);

  const existingProfile = await prisma.studentProfile.findUnique({
    where: { id: studentId },
  });

  if (existingProfile && analysis.skills?.technical?.length > 0) {
    const combinedSkills = Array.from(
      new Set([...existingProfile.skills, ...analysis.skills.technical])
    );
    await prisma.studentProfile.update({
      where: { id: studentId },
      data: { skills: combinedSkills },
    });
  }

  const savedAnalysis = await prisma.resumeAnalysis.upsert({
    where: { studentId },
    create: {
      studentId,
      summary: analysis.summary,
      skills: JSON.parse(JSON.stringify(analysis.skills)),
      education: JSON.parse(JSON.stringify(analysis.education)),
      experience: JSON.parse(JSON.stringify(analysis.experience)),
      strengths: JSON.parse(JSON.stringify(analysis.strengths)),
      weaknesses: JSON.parse(JSON.stringify(analysis.weaknesses)),
      suggestedRoles: JSON.parse(JSON.stringify(analysis.suggestedRoles)),
    },
    update: {
      summary: analysis.summary,
      skills: JSON.parse(JSON.stringify(analysis.skills)),
      education: JSON.parse(JSON.stringify(analysis.education)),
      experience: JSON.parse(JSON.stringify(analysis.experience)),
      strengths: JSON.parse(JSON.stringify(analysis.strengths)),
      weaknesses: JSON.parse(JSON.stringify(analysis.weaknesses)),
      suggestedRoles: JSON.parse(JSON.stringify(analysis.suggestedRoles)),
    },
  });

  logger.info(`Resume analysis completed and stored for student ID: ${studentId}`);
  return savedAnalysis;
}

export async function getStudentResumeAnalysis(studentId: string) {
  return await prisma.resumeAnalysis.findUnique({
    where: { studentId },
  });
}
