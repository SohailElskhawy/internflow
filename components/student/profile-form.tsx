'use client'
import { useState, useEffect } from "react"
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

import { studentProfileSchema, StudentProfileFormData } from "@/lib/schemas/student.schema"

export function ProfileForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)

    const {
        register,
        handleSubmit,
        setError,
        clearErrors,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<StudentProfileFormData>({
        resolver: zodResolver(studentProfileSchema),
    })

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch("/api/students/profile")
                if (response.ok) {
                    const resData = await response.json()
                    const profile = resData.data || resData
                    reset({
                        university: profile.university || "",
                        major: profile.major || "",
                        skills: Array.isArray(profile.skills) ? profile.skills.join(", ") : "",
                        cvUrl: profile.cvUrl || "",
                    })
                }
            } catch (error) {
                console.error("Failed to fetch profile", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchProfile()
    }, [reset])

    const onSubmit = async (data: StudentProfileFormData) => {
        try {
            clearErrors("root")

            const payload = {
                ...data,
                skills: data.skills.split(",").map(skill => skill.trim()).filter(Boolean)
            }

            const response = await fetch("/api/students/profile", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            })

            const result = await response.json()

            if (!response.ok || result.error) {
                setError("root", {
                    type: "server",
                    message: result.error || "Failed to update profile. Please try again."
                })
                return
            }

            router.refresh()
            window.location.reload()
        } catch {
            setError("root", {
                type: "server",
                message: "An unexpected error occurred. Please try again."
            })
        }
    }

    if (isLoading) {
        return <div className="p-4 text-center">Loading profile...</div>
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>Student Profile</CardTitle>
                    <CardDescription>
                        Update your academic details and skills to apply for internships.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="grid w-full gap-6">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="university">University</FieldLabel>
                                <Input
                                    id="university"
                                    placeholder="E.g., Stanford University"
                                    {...register("university")}
                                />
                                {errors.university && (
                                    <FieldDescription className="text-destructive">
                                        {errors.university.message}
                                    </FieldDescription>
                                )}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="major">Major</FieldLabel>
                                <Input
                                    id="major"
                                    placeholder="E.g., Computer Science"
                                    {...register("major")}
                                />
                                {errors.major && (
                                    <FieldDescription className="text-destructive">
                                        {errors.major.message}
                                    </FieldDescription>
                                )}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="skills">Skills (comma separated)</FieldLabel>
                                <Input
                                    id="skills"
                                    placeholder="E.g., React, Node.js, Python"
                                    {...register("skills")}
                                />
                                {errors.skills && (
                                    <FieldDescription className="text-destructive">
                                        {errors.skills.message}
                                    </FieldDescription>
                                )}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="cvUrl">CV URL</FieldLabel>
                                <Input
                                    id="cvUrl"
                                    type="url"
                                    placeholder="https://example.com/my-cv.pdf"
                                    {...register("cvUrl")}
                                />
                                {errors.cvUrl && (
                                    <FieldDescription className="text-destructive">
                                        {errors.cvUrl.message}
                                    </FieldDescription>
                                )}
                            </Field>

                            {errors.root && (
                                <FieldDescription className="text-destructive">
                                    {errors.root.message}
                                </FieldDescription>
                            )}
                        </FieldGroup>

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Save Profile"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
