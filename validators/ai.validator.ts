import { z } from "zod";

export const analyzeResumeSchema = z.object({
  resumeText: z.string().min(20, "Resume text must be at least 20 characters long").optional(),
});

export const matchJobSchema = z.object({
  internshipId: z.string().uuid("Invalid internship ID format"),
});

export const coverLetterSchema = z.object({
  internshipId: z.string().uuid("Invalid internship ID format"),
  customNotes: z.string().max(500).optional(),
});

export const interviewPrepSchema = z.object({
  internshipId: z.string().uuid("Invalid internship ID format"),
});

export const aiChatSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(1000, "Message too long"),
});
