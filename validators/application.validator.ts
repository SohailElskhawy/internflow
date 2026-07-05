import { z } from "zod";

export const applyInternshipSchema = z.object({
  internshipId: z.string().uuid("Invalid internship ID format").or(z.string().min(1, "Internship ID is required")),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(["PENDING", "ACCEPTED", "REJECTED"], {
    error: "Status must be PENDING, ACCEPTED, or REJECTED",
  }),
});

export type ApplyInternshipInput = z.infer<typeof applyInternshipSchema>;
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;
