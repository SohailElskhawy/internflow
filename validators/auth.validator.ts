import { loginSchema, registerSchema, LoginFormData, RegisterFormData } from "@/lib/schemas/auth.schema";

export { loginSchema, registerSchema };
export type LoginInput = LoginFormData;
export type RegisterInput = RegisterFormData;
