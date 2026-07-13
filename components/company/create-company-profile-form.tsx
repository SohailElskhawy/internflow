"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { companyProfileSchema, CompanyProfileFormData } from "@/lib/schemas/company.schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function CreateCompanyProfileForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CompanyProfileFormData>({
        resolver: zodResolver(companyProfileSchema),
        defaultValues: {
            name: "",
            description: "",
        },
    });

    const onSubmit = async (data: CompanyProfileFormData) => {
        setLoading(true);
        try {
            const res = await fetch("/api/companies", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (res.ok) {
                router.refresh();
            } else {
                alert("Failed to create company profile");
            }
        } catch (error) {
            console.error("Error creating company profile:", error);
            alert("Error creating company profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="max-w-md w-full">
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardHeader>
                    <CardTitle>Create Company Profile</CardTitle>
                    <CardDescription>Tell us about your company before you can start posting internships.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Company Name</Label>
                        <Input 
                            id="name"
                            {...register("name")}
                            placeholder="e.g. Acme Corp"
                        />
                        {errors.name && <p className="text-destructive text-sm font-medium">{errors.name.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="description">About the Company</Label>
                        <textarea 
                            id="description"
                            {...register("description")}
                            className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background"
                            rows={4}
                            placeholder="What does your company do?"
                        />
                        {errors.description && <p className="text-destructive text-sm font-medium">{errors.description.message}</p>}
                    </div>
                    
                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? "Creating..." : "Create Profile"}
                    </Button>
                </CardContent>
            </form>
        </Card>
    );
}
