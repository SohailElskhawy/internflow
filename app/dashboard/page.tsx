"use client";

import { Student } from "@/lib/types/student";
import { useEffect, useState } from "react";
import { ProfileForm } from "@/components/student/profile-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Briefcase, UserCheck, ArrowRight } from "lucide-react";
import { ResumeAnalysisCard } from "@/components/ai/ResumeAnalysisCard";
import { AiCareerAdvisorChat } from "@/components/ai/AiCareerAdvisorChat";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { NotificationSettings } from "@/components/notification/NotificationSettings";

export default function DashboardPage() {
    const [profile, setProfile] = useState<Student | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch("/api/students/profile")
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`Failed to fetch profile: ${res.status}`);
                }
                return res.json();
            })
            .then((resData) => {
                const profileData = resData.data || resData;
                if (profileData && !resData.error && profileData.university) {
                    setProfile(profileData);
                }
            })
            .catch((err) => {
                console.log("Profile not found or unauthorized:", err.message);
            })
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) return <div className="p-8 text-muted-foreground">Loading dashboard...</div>;

    return (
        <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20 selection:text-primary">
            <LandingHeader />
            <main className="flex-1 container mx-auto p-8 space-y-8 max-w-5xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
                        <p className="text-muted-foreground mt-1">Manage your student profile and track your internship applications.</p>
                    </div>
                    {profile && (
                        <Button asChild className="gap-2 font-semibold">
                            <Link href="/dashboard/applications">
                                <Briefcase className="w-4 h-4" /> My Applications <ArrowRight className="w-4 h-4" />
                            </Link>
                        </Button>
                    )}
                </div>

                {!profile ? (
                    <div className="bg-muted/50 p-6 rounded-xl border mb-6 space-y-4">
                        <div className="space-y-1">
                            <h2 className="text-xl font-semibold">Welcome! Let&apos;s set up your profile</h2>
                            <p className="text-muted-foreground">You need an active profile to apply for internships.</p>
                        </div>
                        <ProfileForm />
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* AI Resume Analysis Section */}
                        <ResumeAnalysisCard />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Show profile details */}
                            <div className="border rounded-xl p-6 bg-card space-y-4 shadow-xs">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <UserCheck className="w-5 h-5 text-primary" /> Your Profile Info
                                </h2>
                                <ul className="space-y-3 text-sm border-t pt-4">
                                    <li className="flex justify-between">
                                        <span className="text-muted-foreground font-medium">University:</span>
                                        <span className="font-semibold">{profile.university}</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span className="text-muted-foreground font-medium">Major:</span>
                                        <span className="font-semibold">{profile.major}</span>
                                    </li>
                                    <li className="space-y-1.5 pt-2 border-t">
                                        <span className="text-muted-foreground font-medium block">Skills:</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {profile.skills && profile.skills.length > 0 ? (
                                                profile.skills.map((skill, idx) => (
                                                    <span key={idx} className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                                                        {skill}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-muted-foreground">No skills listed.</span>
                                            )}
                                        </div>
                                    </li>
                                </ul>

                                <div className="pt-4 border-t">
                                    <Button asChild variant="outline" className="w-full gap-2">
                                        <Link href="/dashboard/applications">
                                            <Briefcase className="w-4 h-4" /> View Application Statuses
                                        </Link>
                                    </Button>
                                </div>
                            </div>

                            {/* Or let them update it */}
                            <div className="border rounded-xl p-6 bg-card shadow-xs">
                                <h2 className="text-xl font-semibold mb-4">Update Profile</h2>
                                <ProfileForm />
                            </div>
                        </div>

                        {/* Notification settings panel */}
                        <div className="pt-4 border-t">
                            <NotificationSettings />
                        </div>
                    </div>
                )}

                {/* Floating AI Career Advisor Chat Widget */}
                <AiCareerAdvisorChat />
            </main>
        </div>
    );
}