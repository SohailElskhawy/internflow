import { z } from "zod";
import { internshipSchema, InternshipFormData } from "@/lib/schemas/internship.schema";

export const createInternshipSchema = internshipSchema;
export const updateInternshipSchema = createInternshipSchema.partial();

export type CreateInternshipInput = InternshipFormData;
export type UpdateInternshipInput = z.infer<typeof updateInternshipSchema>;
