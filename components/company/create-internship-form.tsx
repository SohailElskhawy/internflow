"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { internshipSchema, InternshipFormData } from "@/lib/schemas/internship.schema";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CreateInternshipForm({ companyId }: { companyId: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<InternshipFormData>({
        resolver: zodResolver(internshipSchema),
        defaultValues: {
            title: "",
            description: "",
            location: "",
            type: "",
        },
    });

    const onSubmit = async (data: InternshipFormData) => {
        setLoading(true);
        try {
            const res = await fetch("/api/internships", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...data, companyId }),
            });
            if (res.ok) {
                reset();
                router.refresh();
            } else {
                alert("Failed to create internship");
            }
        } catch (error) {
            console.error("Error creating internship:", error);
            alert("Error creating internship");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardHeader>
                    <CardTitle>Internship Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input 
                            id="title"
                            {...register("title")}
                            placeholder="e.g. Software Engineering Intern"
                        />
                        {errors.title && <p className="text-destructive text-sm font-medium">{errors.title.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <textarea 
                            id="description"
                            {...register("description")}
                            className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background"
                            rows={4}
                            placeholder="Describe the role..."
                        />
                        {errors.description && <p className="text-destructive text-sm font-medium">{errors.description.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input 
                            id="location"
                            {...register("location")}
                            placeholder="e.g. San Francisco, CA"
                        />
                        {errors.location && <p className="text-destructive text-sm font-medium">{errors.location.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                        <Input 
                            id="type"
                            {...register("type")}
                            placeholder="e.g. Full-time, Remote, Hybrid"
                        />
                        {errors.type && <p className="text-destructive text-sm font-medium">{errors.type.message}</p>}
                    </div>
                    
                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? "Posting..." : "Post Internship"}
                    </Button>
                </CardContent>
            </form>
        </Card>
    );
}
