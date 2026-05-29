"use client";

import { Student } from "@/lib/types/student";
import { useEffect, useState } from "react";

export default function DashboardPage() {
    const [profile, setProfile] = useState<Student | null>(null);

    useEffect(() => {
        fetch("/api/students/profile")
            .then((res) => res.json())
            .then((data) => setProfile(data));
    }, []);

    return (
        <div>
            <h1>Student Dashboard</h1>

            <pre>
                {JSON.stringify(profile, null, 2)}
            </pre>
        </div>
    );
}