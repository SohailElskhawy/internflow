import { prisma } from "@/lib/db";
import { generateGeminiJson } from "@/lib/ai/client";
import { careerAdvisorPrompt } from "@/prompts/career-advisor.prompt";
import { logger } from "@/lib/logger";

export interface ChatResponseResult {
  reply: string;
  suggestedNextQuestions: string[];
}

export async function askCareerAdvisor(studentId: string, userMessage: string): Promise<ChatResponseResult> {
  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: { user: true, resumeAnalysis: true },
  });

  const studentContext = student
    ? `Student Name: ${student.user.name}, Major: ${student.major}, University: ${student.university}, Skills: ${student.skills.join(", ")}, CV Summary: ${student.resumeAnalysis?.summary || "N/A"}`
    : "General Software Engineering Student";

  const prompt = careerAdvisorPrompt
    .replace("{{STUDENT_CONTEXT}}", studentContext)
    .replace("{{USER_MESSAGE}}", userMessage);

  const mockFallback = (): ChatResponseResult => {
    const msgLower = userMessage.toLowerCase();
    if (msgLower.includes("jwt") || msgLower.includes("auth")) {
      return {
        reply: "### Understanding JSON Web Tokens (JWT)\n\nJWT is a compact, URL-safe means of representing claims between two parties.\n\n- **Header**: Specifies algorithm (e.g., HS256) and token type.\n- **Payload**: Contains claims like `userId`, `role`, and `exp` timestamp.\n- **Signature**: Formed by hashing header + payload with a secret key.\n\n**Best Practice for Internships**:\nStore JWTs in HTTP-Only, SameSite cookies to mitigate XSS attacks!",
        suggestedNextQuestions: [
          "How to handle refresh tokens securely?",
          "What is the difference between session-based and token-based auth?",
        ],
      };
    }

    if (msgLower.includes("cv") || msgLower.includes("resume") || msgLower.includes("improve")) {
      return {
        reply: `### How to Upgrade Your Software Resume\n\n1. **Highlight Core Tech Stack**: Put your strongest technologies (${student?.skills.slice(0, 4).join(", ") || "React, Node, SQL"}) right at the top.\n2. **Quantify Achievements**: Instead of *"Built an API"*, write *"Designed 5 REST endpoints handling user authorization with Zod validation"*\n3. **Add Deployments**: Include live demo links and GitHub repository links for full-stack projects!`,
        suggestedNextQuestions: [
          "What software projects catch a recruiter's eye?",
          "How can I prepare for technical interviews?",
        ],
      };
    }

    return {
      reply: `Great question! To stand out for software internships, focus on building **end-to-end full-stack applications** with clean architecture (e.g. Next.js, PostgreSQL, Prisma, Zod validation). Emphasize project quality, clean code, unit testing, and Docker deployment over quantity!`,
      suggestedNextQuestions: [
        "What key skills are recruiters looking for right now?",
        "How do I prepare for my upcoming interview?",
      ],
    };
  };

  const result = await generateGeminiJson<ChatResponseResult>(prompt, mockFallback);
  logger.info(`Career advisor answered question for student ID: ${studentId}`);
  return result;
}
