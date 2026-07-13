"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import Link from "next/link";
import { ArrowLeft, Building2, MapPin, Briefcase, RefreshCw, Milestone } from "lucide-react";
import { ApplicationTimeline } from "@/components/application/ApplicationTimeline";

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
    const [expandedAppId, setExpandedAppId] = useState<string | null>(null);

    useEffect(() => {
        fetch(`/api/students/applications?t=${Date.now()}`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load applications");
                return res.json();
            })
            .then((resData) => {
                const list = Array.isArray(resData) ? resData : (resData.data || []);
                setApplications(list);
            })
            .catch((err) => setError(err.message))
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return (
            <div className="container mx-auto p-8 max-w-4xl mt-10 text-center flex justify-center items-center gap-2 text-muted-foreground">
                <RefreshCw className="w-5 h-5 animate-spin" /> Loading your applications...
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl mt-6 space-y-6 pb-16">
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
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div className="space-y-1.5">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <CardTitle className="text-xl font-bold">
                                                {app.internship.title}
                                            </CardTitle>
                                            <span className="text-muted-foreground">&bull;</span>
                                            <StatusBadge status={app.status} />
                                        </div>
                                        <CardDescription className="flex flex-wrap items-center gap-y-1 gap-x-3 text-sm font-medium text-primary">
                                            <span className="flex items-center gap-1">
                                                <Building2 className="w-3.5 h-3.5" />
                                                {app.internship.company.name}
                                            </span>
                                            <span className="text-muted-foreground/60 hidden sm:inline">|</span>
                                            <span className="flex items-center gap-1 text-muted-foreground">
                                                <MapPin className="w-3.5 h-3.5" />
                                                {app.internship.location}
                                            </span>
                                            <span className="text-muted-foreground/60 hidden sm:inline">|</span>
                                            <span className="flex items-center gap-1 text-muted-foreground">
                                                <Briefcase className="w-3.5 h-3.5" />
                                                {app.internship.type}
                                            </span>
                                        </CardDescription>
                                    </div>
                                    <div className="text-xs text-muted-foreground sm:text-right font-medium shrink-0">
                                        Applied: {new Date(app.createdAt).toLocaleDateString(undefined, {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pb-4">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex gap-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="gap-1.5 text-xs font-semibold"
                                            onClick={() => setExpandedAppId(expandedAppId === app.id ? null : app.id)}
                                        >
                                            <Milestone className="w-3.5 h-3.5 text-primary" /> 
                                            {expandedAppId === app.id ? "Hide Status Details" : "View Status Details"}
                                        </Button>
                                        <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs text-muted-foreground">
                                            <Link href={`/internships/${app.internship.id}`}>
                                                View Original Posting
                                            </Link>
                                        </Button>
                                    </div>
                                </div>

                                {expandedAppId === app.id && (
                                    <div className="mt-4 pt-4 border-t animate-in fade-in slide-in-from-top-2 duration-200">
                                        <ApplicationTimeline applicationId={app.id} />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
