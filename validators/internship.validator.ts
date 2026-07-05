import { z } from "zod";

export const createInternshipSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  type: z.string().min(2, "Type must be at least 2 characters (e.g. Remote, On-site, Hybrid)"),
});

export const updateInternshipSchema = createInternshipSchema.partial();

export type CreateInternshipInput = z.infer<typeof createInternshipSchema>;
export type UpdateInternshipInput = z.infer<typeof updateInternshipSchema>;
