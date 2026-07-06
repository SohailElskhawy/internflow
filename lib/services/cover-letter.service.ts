import { prisma } from "@/lib/db";
import { generateGeminiJson } from "@/lib/ai/client";
import { coverLetterPrompt } from "@/prompts/cover-letter.prompt";
import { logger } from "@/lib/logger";

export interface CoverLetterResult {
  coverLetter: string;
  highlights: string[];
}

export async function generateCoverLetter(studentId: string, internshipId: string, customNotes?: string) {
  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: { user: true, resumeAnalysis: true },
  });

  const internship = await prisma.internship.findUnique({
    where: { id: internshipId },
    include: { company: true },
  });

  if (!student || !internship) {
    throw new Error("Student profile or Internship not found");
  }

  const studentProfile = `
Name: ${student.user.name}
Email: ${student.user.email}
University: ${student.university} (${student.major})
Skills: ${student.skills.join(", ")}
Summary: ${student.resumeAnalysis?.summary || "Dedicated software engineering student"}
Custom Notes: ${customNotes || "None"}
  `.trim();

  const internshipDetails = `
Title: ${internship.title}
Company: ${internship.company.name}
Location: ${internship.location} (${internship.type})
Description: ${internship.description}
  `.trim();

  const prompt = coverLetterPrompt
    .replace("{{STUDENT_PROFILE}}", studentProfile)
    .replace("{{INTERNSHIP_DETAILS}}", internshipDetails);

  const mockFallback = (): CoverLetterResult => ({
    coverLetter: `Dear Hiring Manager at ${internship.company.name},\n\nI am writing to express my strong enthusiasm for the ${internship.title} position. As a student at ${student.university} majoring in ${student.major}, I have developed a solid technical foundation in ${student.skills.slice(0, 3).join(", ") || "full-stack development"}.\n\nYour company's work on ${internship.title} aligns perfectly with my career aspirations. Through hands-on coursework and personal projects, I have demonstrated a strong ability to build reliable web applications and collaborate effectively.\n\nThank you for considering my application. I look forward to the opportunity to discuss how my background and enthusiasm can contribute to ${internship.company.name}.\n\nSincerely,\n${student.user.name}`,
    highlights: [
      `Tailored for ${internship.title} at ${internship.company.name}`,
      `Emphasizes student background in ${student.major}`,
    ],
  });

  const result = await generateGeminiJson<CoverLetterResult>(prompt, mockFallback);
  logger.info(`Generated AI cover letter for student ${studentId} & internship ${internshipId}`);
  return result;
}
