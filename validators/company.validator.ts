import { z } from "zod";

export const companyProfileSchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  description: z.string().min(10, "Company description must be at least 10 characters"),
});

export const updateCompanyApprovalSchema = z.object({
  approved: z.boolean(),
});

export type CompanyProfileInput = z.infer<typeof companyProfileSchema>;
