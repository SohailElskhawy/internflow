import { prisma } from "@/lib/db";
import { generateGeminiJson } from "@/lib/ai/client";
import { interviewPrepPrompt } from "@/prompts/interview-prep.prompt";
import { logger } from "@/lib/logger";

export interface TechnicalQuestion {
  id: number;
  question: string;
  sampleAnswer: string;
  keyPoints: string[];
}

export interface BehavioralQuestion {
  id: number;
  question: string;
  framework: string;
  sampleAnswer: string;
}

export interface StudyTopic {
  topic: string;
  description: string;
  importance: string;
}

export interface InterviewPrepResult {
  technicalQuestions: TechnicalQuestion[];
  behavioralQuestions: BehavioralQuestion[];
  studyTopics: StudyTopic[];
}

export async function generateOrGetInterviewPrep(studentId: string, internshipId: string) {
  const existingPrep = await prisma.interviewPrep.findUnique({
    where: {
      studentId_internshipId: { studentId, internshipId },
    },
  });

  if (existingPrep) {
    return existingPrep;
  }

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
University: ${student.university} (${student.major})
Skills: ${student.skills.join(", ")}
  `.trim();

  const internshipDetails = `
Title: ${internship.title}
Company: ${internship.company.name}
Description: ${internship.description}
  `.trim();

  const prompt = interviewPrepPrompt
    .replace("{{STUDENT_PROFILE}}", studentProfile)
    .replace("{{INTERNSHIP_DETAILS}}", internshipDetails);

  const mockFallback = (): InterviewPrepResult => ({
    technicalQuestions: [
      {
        id: 1,
        question: "Explain the difference between SQL and NoSQL databases and when you would choose PostgreSQL.",
        sampleAnswer: "SQL databases like PostgreSQL are relational, ACID-compliant, and enforce structured schemas, making them ideal for financial or transactional data. NoSQL databases are schema-less and scale horizontally.",
        keyPoints: ["ACID Compliance", "Schema Strictness", "Horizontal vs Vertical Scaling"],
      },
      {
        id: 2,
        question: "How does React state reconciliation work and why are key props important in lists?",
        sampleAnswer: "React uses a virtual DOM diffing algorithm. Keys allow React to uniquely identify elements across renders, avoiding unnecessary DOM rebuilds.",
        keyPoints: ["Virtual DOM", "Diffing Algorithm", "Unique Element Keys"],
      },
      {
        id: 3,
        question: "What is the difference between authenticating with JWT vs Session Cookies?",
        sampleAnswer: "JWT is stateless and signed, ideal for distributed APIs. Session cookies rely on server-side session stores and set HTTP-only cookies.",
        keyPoints: ["Statelessness", "HTTP-Only Security", "Token Verification"],
      },
      {
        id: 4,
        question: "Explain HTTP methods idempotency (e.g. GET/PUT vs POST).",
        sampleAnswer: "An operation is idempotent if executing it multiple times produces the same result on the server. GET, PUT, and DELETE are idempotent; POST is not.",
        keyPoints: ["Idempotency definition", "GET/PUT vs POST behavior"],
      },
      {
        id: 5,
        question: "How do you handle error boundaries and fallback UI in a Next.js App Router application?",
        sampleAnswer: "Next.js App Router uses error.tsx files to automatically wrap route segments in React Error Boundaries.",
        keyPoints: ["React Error Boundary", "Next.js error.tsx", "Fallback state management"],
      },
      {
        id: 6,
        question: "What is Docker containerization and how does it differ from a virtual machine?",
        sampleAnswer: "Docker containerizes applications by sharing the host OS kernel, making containers lightweight compared to VMs running full OS hypervisors.",
        keyPoints: ["Shared Kernel", "Container vs Hypervisor", "Portability"],
      },
      {
        id: 7,
        question: "What are Promises in JavaScript and how does async/await improve code readability?",
        sampleAnswer: "Promises represent asynchronous operations. Async/await provides syntactic sugar over promises, avoiding callback hell.",
        keyPoints: ["Event Loop", "Promise states", "Error handling with try/catch"],
      },
      {
        id: 8,
        question: "Explain how database indexing improves query speed and its potential downside.",
        sampleAnswer: "B-Tree indexes speed up SELECT queries by avoiding full table scans, but slow down WRITE (INSERT/UPDATE) operations due to index rebalancing.",
        keyPoints: ["B-Tree structure", "Full table scan prevention", "Write penalty"],
      },
      {
        id: 9,
        question: "How do you secure API endpoints against unauthorized access?",
        sampleAnswer: "Implement JWT/Session verification middleware, validate request schemas with Zod, enforce RBAC permissions, and sanitize input.",
        keyPoints: ["Auth Middleware", "RBAC", "Input Sanitization"],
      },
      {
        id: 10,
        question: "What strategies do you use for optimizing frontend page load performance?",
        sampleAnswer: "Use code splitting, dynamic imports, image optimization, memoizing heavy components, and caching API requests.",
        keyPoints: ["Code Splitting", "Memoization", "Assets Optimization"],
      },
    ],
    behavioralQuestions: [
      {
        id: 1,
        question: "Describe a time you faced a tough technical bug and how you resolved it.",
        framework: "STAR Method: Situation, Task, Action, Result",
        sampleAnswer: "Describe the bug context clearly, step-by-step debugging tools used (logging, browser devtools), solution implemented, and preventative test added.",
      },
      {
        id: 2,
        question: "How do you prioritize tasks when working under tight project deadlines?",
        framework: "Eisenhower Matrix / Agile Sprint Prioritization",
        sampleAnswer: "Focus on core MVP deliverables first, communicate proactively with mentors/teammates, and break tasks into actionable tickets.",
      },
      {
        id: 3,
        question: "Tell me about a time you had to learn a new tool or framework quickly.",
        framework: "Learning Agility & Resourcefulness",
        sampleAnswer: "Explain your process: reading official documentation, building small sandbox prototypes, and integrating the framework into the codebase.",
      },
      {
        id: 4,
        question: "How do you handle constructive feedback during code reviews?",
        framework: "Growth Mindset & Code Ownership",
        sampleAnswer: "View feedback as a learning opportunity, ask clarifying questions, apply requested improvements, and update documentation.",
      },
      {
        id: 5,
        question: "Describe a project where you collaborated with a team.",
        framework: "Teamwork & Communication",
        sampleAnswer: "Highlight clear communication channels, version control workflow (Git feature branches/PRs), and supporting teammates.",
      },
    ],
    studyTopics: [
      {
        topic: "RESTful API Design & RBAC Middleware",
        description: "Review HTTP status codes, request validation with Zod, and role-based permissions.",
        importance: "High",
      },
      {
        topic: "SQL Database Queries & Relations",
        description: "Practice Prisma queries, foreign keys, 1-to-many & 1-to-1 relationships.",
        importance: "High",
      },
      {
        topic: "React 19 & Next.js Performance",
        description: "Study component memoization, useCallback hooks, and server vs client components.",
        importance: "Medium",
      },
      {
        topic: "Docker Fundamentals",
        description: "Understand Dockerfile commands, containers, and local development setup.",
        importance: "Medium",
      },
    ],
  });

  const result = await generateGeminiJson<InterviewPrepResult>(prompt, mockFallback);

  const saved = await prisma.interviewPrep.upsert({
    where: {
      studentId_internshipId: { studentId, internshipId },
    },
    create: {
      studentId,
      internshipId,
      technicalQuestions: JSON.parse(JSON.stringify(result.technicalQuestions)),
      behavioralQuestions: JSON.parse(JSON.stringify(result.behavioralQuestions)),
      studyTopics: JSON.parse(JSON.stringify(result.studyTopics)),
    },
    update: {
      technicalQuestions: JSON.parse(JSON.stringify(result.technicalQuestions)),
      behavioralQuestions: JSON.parse(JSON.stringify(result.behavioralQuestions)),
      studyTopics: JSON.parse(JSON.stringify(result.studyTopics)),
    },
  });

  logger.info(`Generated AI Interview Prep kit for student ${studentId} & internship ${internshipId}`);
  return saved;
}
