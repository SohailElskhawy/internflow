"use client";

import { Student } from "@/lib/types/student";
import { useEffect, useState } from "react";
import { ProfileForm } from "@/components/student/profile-form";

export default function DashboardPage() {
    const [profile, setProfile] = useState<Student | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch("/api/students/profile")
            .then((res) => res.json())
            .then((data) => {
                // If there's an error (like Profile not found), profile stays null
                if (!data.error) {
                    setProfile(data);
                }
            })
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) return <div className="p-8">Loading dashboard...</div>;

    return (
        <div className="container mx-auto p-8 space-y-8">
            <h1 className="text-3xl font-bold">Student Dashboard</h1>

            {!profile ? (
                <div className="bg-muted p-6 rounded-lg mb-6">
                    <h2 className="text-xl font-semibold mb-2">Welcome! Let&apos;s set up your profile</h2>
                    <p className="text-muted-foreground mb-4">You need an active profile to apply for internships.</p>
                    <ProfileForm />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Show profile details */}
                    <div className="border rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Your Profile Info</h2>
                        <ul className="space-y-2 text-sm">
                            <li><strong>University:</strong> {profile.university}</li>
                            <li><strong>Major:</strong> {profile.major}</li>
                            <li><strong>Skills:</strong> {profile.skills?.join(", ")}</li>
                        </ul>
                    </div>

                    {/* Or let them update it */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Update Profile</h2>
                        <ProfileForm />
                    </div>
                </div>
            )}
        </div>
    );
}