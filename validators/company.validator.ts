import { z } from "zod";
import { companyProfileSchema, CompanyProfileFormData } from "@/lib/schemas/company.schema";

export { companyProfileSchema };

export const updateCompanyApprovalSchema = z.object({
  approved: z.boolean(),
});

export type CompanyProfileInput = CompanyProfileFormData;
