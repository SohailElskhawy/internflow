'use client'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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

      const result = await response.json()

      if (!response.ok || result.error) {
        setError("root", {
          type: "server",
          message: result.error || "Failed to register. Please try again."
        })
        return
      }

      // 4. Success: redirect and refresh server components
      router.push("/")
      router.refresh()
    } catch {
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
                <Input id="password" type="password" required {...register("password")} />
                {
                  errors.root && (
                    <FieldDescription className="text-destructive">
                      {errors.root.message}
                    </FieldDescription>
                  )
                }
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Confirm Password</FieldLabel>
                </div>
                <Input id="confirm-password" type="password" required {...register("confirmPassword")} />
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
