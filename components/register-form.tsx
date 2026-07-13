'use client'
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { registerSchema, RegisterFormData } from "@/lib/schemas/auth.schema"

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      clearErrors("root")

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      let result: { success?: boolean; error?: string; token?: string } = {}
      try {
        result = await response.json()
      } catch (jsonErr) {
        console.error("JSON parse error from /api/auth/register:", jsonErr)
      }

      if (!response.ok || result.error) {
        const errorMsg = result.error || "Failed to register. Please try again."
        console.warn("Registration failed:", errorMsg, result)
        setError("root", {
          type: "server",
          message: errorMsg
        })
        return
      }

      // Success: redirect and refresh server components
      router.push("/")
      router.refresh()
    } catch (err) {
      console.error("Register submission error:", err)
      setError("root", {
        type: "server",
        message: "An unexpected error occurred. Please try again."
      })
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Register for an account</CardTitle>
          <CardDescription>
            Enter your details below to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid w-full gap-6">
            <FieldGroup>
              <Field>
                <FieldLabel>Role</FieldLabel>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Input
                      id="role-student"
                      type="radio"
                      value="STUDENT"
                      required
                      className="w-4 h-4"
                      {...register("role")}
                    />
                    <label htmlFor="role-student" className="text-sm font-medium">Student</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      id="role-company"
                      type="radio"
                      value="COMPANY"
                      required
                      className="w-4 h-4"
                      {...register("role")}
                    />
                    <label htmlFor="role-company" className="text-sm font-medium">Company</label>
                  </div>
                </div>
              </Field>
              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  {...register("name")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  {...register("email")}
                />
                {/* Check for errors.email, NOT errors.root */}
                {errors.email && (
                  <FieldDescription className="text-destructive">
                    {errors.email.message}
                  </FieldDescription>
                )}
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                </div>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} required {...register("password")} className="pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
                </div>
                <div className="relative">
                  <Input id="confirm-password" type={showConfirmPassword ? "text" : "password"} required {...register("confirmPassword")} className="pr-10" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {
                  errors.root && (
                    <FieldDescription className="text-destructive">
                      {errors.root.message}
                    </FieldDescription>
                  )
                }
              </Field>
              <Field>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating account..." : "Create account"}
                </Button>
                <FieldDescription className="text-center">
                  Already have an account? <a href="/login">Sign in</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
