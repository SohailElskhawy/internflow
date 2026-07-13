import * as z from "zod";

export const studentProfileSchema = z.object({
    university: z.string().min(2, "University name is required"),
    major: z.string().min(2, "Major is required"),
    skills: z.string().min(2, "At least one skill is required. Separate with commas."),
    cvUrl: z.url("Must be a valid URL").optional().or(z.literal("")),
});

export type StudentProfileFormData = z.infer<typeof studentProfileSchema>;
