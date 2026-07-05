import { z } from "zod";

export const studentProfileSchema = z.object({
  university: z.string().min(2, "University must be at least 2 characters"),
  major: z.string().min(2, "Major must be at least 2 characters"),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  cvUrl: z.string().url("CV URL must be a valid URL").optional().or(z.literal("")),
});

export type StudentProfileInput = z.infer<typeof studentProfileSchema>;
