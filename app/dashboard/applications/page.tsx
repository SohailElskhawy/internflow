"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Clock, CheckCircle2, XCircle, Building2, MapPin, Briefcase, RefreshCw } from "lucide-react";

interface StudentApplication {
    id: string;
    status: "PENDING" | "ACCEPTED" | "REJECTED";
    createdAt: string;
    internship: {
        id: string;
        title: string;
        location: string;
        type: string;
        description: string;
        company: {
            id: string;
            name: string;
        };
    };
}

export default function StudentApplicationsPage() {
    const [applications, setApplications] = useState<StudentApplication[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/students/applications")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load applications");
                return res.json();
            })
            .then((data) => setApplications(data))
            .catch((err) => setError(err.message))
            .finally(() => setIsLoading(false));
    }, []);

    const renderStatusBadge = (status: StudentApplication["status"]) => {
        switch (status) {
            case "ACCEPTED":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        <CheckCircle2 className="w-4 h-4" /> Accepted
                    </span>
                );
            case "REJECTED":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                        <XCircle className="w-4 h-4" /> Rejected
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        <Clock className="w-4 h-4" /> Pending Review
                    </span>
                );
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto p-8 max-w-4xl mt-10 text-center flex justify-center items-center gap-2 text-muted-foreground">
                <RefreshCw className="w-5 h-5 animate-spin" /> Loading your applications...
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl mt-6 space-y-6">
            <Button variant="ghost" asChild className="gap-2">
                <Link href="/dashboard">
                    <ArrowLeft className="w-4 h-4" /> Back to Profile
                </Link>
            </Button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        My Internship Applications
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Track the status of your submitted applications in real-time.
                    </p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-lg text-sm font-medium">
                    {error}
                </div>
            )}

            {applications.length === 0 ? (
                <Card className="p-12 text-center border-dashed">
                    <CardContent className="space-y-4 pt-6">
                        <Briefcase className="w-12 h-12 text-muted-foreground mx-auto" />
                        <h3 className="text-xl font-semibold">No applications yet</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            You haven&apos;t applied to any internships yet. Browse available listings and submit your application!
                        </p>
                        <Button asChild className="mt-2">
                            <Link href="/internships">Browse Internships</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {applications.map((app) => (
                        <Card key={app.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div>
                                        <CardTitle className="text-xl font-bold">
                                            {app.internship.title}
                                        </CardTitle>
                                        <CardDescription className="text-sm font-medium text-primary flex items-center gap-1 mt-0.5">
                                            <Building2 className="w-3.5 h-3.5" /> {app.internship.company.name}
                                        </CardDescription>
                                    </div>
                                    <div className="self-start sm:self-center">
                                        {renderStatusBadge(app.status)}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg border">
                                    <span className="flex items-center gap-1 font-medium text-foreground">
                                        <MapPin className="w-3.5 h-3.5 text-primary" /> {app.internship.location}
                                    </span>
                                    <span className="flex items-center gap-1 font-medium text-foreground">
                                        <Briefcase className="w-3.5 h-3.5 text-primary" /> {app.internship.type}
                                    </span>
                                    <span>
                                        Applied on: {new Date(app.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex justify-end pt-2">
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/internships/${app.internship.id}`}>View Internship Details</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
