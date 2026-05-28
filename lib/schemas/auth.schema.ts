import { z } from "zod"


export const loginSchema = z.object({
    email: z.email("Invalid email address"),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters"),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const registerSchema = z.object({
    email: z.email("Invalid email address"), // Note: z.string().email() is the proper format
    name: z.string().min(2, "Name must be at least 2 characters"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm Password must be at least 8 characters"),
    role: z.enum(["STUDENT", "COMPANY"]), 
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // This path tells react-hook-form which field to attach the error to
});

export type RegisterFormData = z.infer<typeof registerSchema>