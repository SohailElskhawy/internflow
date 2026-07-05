"use client";

import { use, useEffect, useState, useCallback, useMemo } from "react";
import { ApplicantCard, ApplicationItem } from "@/components/company/applicant-card";
import { StudentProfileModal, StudentProfileData } from "@/components/company/student-profile-modal";
import { Status } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ArrowLeft, Search, Users, RefreshCw } from "lucide-react";

export default function ApplicantsPage({
    params,
}: {
    params: Promise<{ internshipId: string }>;
}) {
    const { internshipId } = use(params);

    const [applications, setApplications] = useState<ApplicationItem[]>([]);
    const [internshipTitle, setInternshipTitle] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Filters & Search
    const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
    const [searchQuery, setSearchQuery] = useState<string>("");

    // Modal State
    const [selectedStudent, setSelectedStudent] = useState<StudentProfileData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    // Updating map state to prevent rapid clicks per application
    const [updatingIds, setUpdatingIds] = useState<Record<string, boolean>>({});

    useEffect(() => {
        let isSubscribed = true;

        async function fetchApplicants() {
            try {
                const queryParams = new URLSearchParams();
                if (selectedStatus !== "ALL") queryParams.set("status", selectedStatus);
                if (searchQuery.trim() !== "") queryParams.set("search", searchQuery.trim());

                const res = await fetch(`/api/company/internships/${internshipId}/applicants?${queryParams.toString()}`);
                
                if (!isSubscribed) return;

                if (res.status === 403) {
                    setError("You do not have permission to view applicants for this internship.");
                    setIsLoading(false);
                    return;
                }

                if (!res.ok) {
                    const data = await res.json();
                    setError(data.error || "Failed to load applicants.");
                    setIsLoading(false);
                    return;
                }

                const data = await res.json();
                setApplications(data.data || []);
                setInternshipTitle(data.internshipTitle || "Internship");
            } catch (err) {
                if (isSubscribed) {
                    console.error("Error fetching applicants:", err);
                    setError("An error occurred while loading applicants.");
                }
            } finally {
                if (isSubscribed) {
                    setIsLoading(false);
                }
            }
        }

        fetchApplicants();

        return () => {
            isSubscribed = false;
        };
    }, [internshipId, selectedStatus, searchQuery]);

    // Handle Accept / Reject status update
    const handleStatusChange = useCallback(async (applicationId: string, newStatus: Status) => {
        setUpdatingIds((prev) => ({ ...prev, [applicationId]: true }));
        try {
            const res = await fetch(`/api/applications/${applicationId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) {
                const data = await res.json();
                alert(data.error || "Failed to update application status.");
                return;
            }

            // Optimistic / Local state update
            setApplications((prev) =>
                prev.map((app) => (app.id === applicationId ? { ...app, status: newStatus } : app))
            );
        } catch (err) {
            console.error("Status update error:", err);
            alert("Error updating application status.");
        } finally {
            setUpdatingIds((prev) => ({ ...prev, [applicationId]: false }));
        }
    }, []);

    const handleViewProfile = useCallback((student: StudentProfileData) => {
        setSelectedStudent(student);
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedStudent(null);
    }, []);

    // Filter status counts
    const statusCounts = useMemo(() => {
        const counts = { ALL: applications.length, PENDING: 0, ACCEPTED: 0, REJECTED: 0 };
        applications.forEach((app) => {
            if (app.status in counts) {
                counts[app.status as keyof typeof counts]++;
            }
        });
        return counts;
    }, [applications]);

    return (
        <div className="container mx-auto p-4 max-w-6xl mt-6 space-y-6">
            {/* Header */}
            <div>
                <Button variant="ghost" asChild className="mb-4 gap-2">
                    <Link href="/company/dashboard">
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </Link>
                </Button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Applicants for {internshipTitle}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Review, accept, or reject student candidates.
                        </p>
                    </div>
                </div>
            </div>

            {/* Error state */}
            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-lg text-sm font-medium">
                    {error}
                </div>
            )}

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search by name, university, or major..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* Status Tabs */}
                <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border">
                    {["ALL", "PENDING", "ACCEPTED", "REJECTED"].map((st) => (
                        <button
                            key={st}
                            onClick={() => setSelectedStatus(st)}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                                selectedStatus === st
                                    ? "bg-background text-foreground shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {st === "ALL"
                                ? `All (${statusCounts.ALL})`
                                : `${st.charAt(0) + st.slice(1).toLowerCase()} (${statusCounts[st as keyof typeof statusCounts]})`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Applicants List / Grid */}
            {isLoading ? (
                <div className="p-12 text-center text-muted-foreground flex items-center justify-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin" /> Loading applicants...
                </div>
            ) : applications.length === 0 ? (
                <div className="text-center p-12 border-2 border-dashed rounded-xl bg-muted/10 space-y-4">
                    <div className="inline-flex p-4 rounded-full bg-muted/40 text-muted-foreground">
                        <Users className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-lg font-semibold">No applicants found</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                            {searchQuery || selectedStatus !== "ALL"
                                ? "No candidates matched your search or status filter."
                                : "No applicants yet. Share this internship to receive applications."}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {applications.map((app) => (
                        <ApplicantCard
                            key={app.id}
                            application={app}
                            onViewProfile={handleViewProfile}
                            onStatusChange={handleStatusChange}
                            isUpdating={updatingIds[app.id] || false}
                        />
                    ))}
                </div>
            )}

            {/* Profile Modal */}
            <StudentProfileModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                student={selectedStudent}
            />
        </div>
    );
}
