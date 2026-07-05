"use client";

import { memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StudentProfileData } from "./student-profile-modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { Status } from "@prisma/client";
import { Check, X, Eye, GraduationCap } from "lucide-react";

export interface ApplicationItem {
    id: string;
    studentId: string;
    internshipId: string;
    status: Status;
    createdAt: string | Date;
    student: StudentProfileData;
}

interface ApplicantCardProps {
    application: ApplicationItem;
    onViewProfile: (student: StudentProfileData) => void;
    onStatusChange: (applicationId: string, newStatus: Status) => Promise<void>;
    isUpdating?: boolean;
}

export const ApplicantCard = memo(function ApplicantCard({
    application,
    onViewProfile,
    onStatusChange,
    isUpdating = false,
}: ApplicantCardProps) {
    const handleAccept = useCallback(() => {
        onStatusChange(application.id, "ACCEPTED");
    }, [application.id, onStatusChange]);

    const handleReject = useCallback(() => {
        onStatusChange(application.id, "REJECTED");
    }, [application.id, onStatusChange]);

    const handleView = useCallback(() => {
        onViewProfile(application.student);
    }, [application.student, onViewProfile]);

    return (
        <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <h3 className="text-xl font-bold tracking-tight text-foreground">
                            {application.student.user.name}
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <GraduationCap className="w-4 h-4 text-primary" />
                            {application.student.university} &bull; {application.student.major}
                        </p>
                    </div>
                    <div className="self-start sm:self-center">
                        <StatusBadge status={application.status} />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Skills List */}
                <div className="flex flex-wrap gap-1.5">
                    {application.student.skills && application.student.skills.length > 0 ? (
                        application.student.skills.map((skill, idx) => (
                            <span
                                key={idx}
                                className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-secondary text-secondary-foreground"
                            >
                                {skill}
                            </span>
                        ))
                    ) : (
                        <span className="text-xs text-muted-foreground">No skills specified</span>
                    )}
                </div>

                {/* Actions Bar */}
                <div className="flex flex-wrap items-center justify-between pt-3 border-t gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleView}
                        className="gap-1.5 text-xs font-medium"
                    >
                        <Eye className="w-3.5 h-3.5" /> View Profile
                    </Button>

                    <div className="flex items-center gap-2">
                        <Button
                            variant={application.status === "ACCEPTED" ? "default" : "outline"}
                            size="sm"
                            disabled={isUpdating || application.status === "ACCEPTED"}
                            onClick={handleAccept}
                            className="gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
                        >
                            <Check className="w-3.5 h-3.5" /> Accept
                        </Button>
                        <Button
                            variant={application.status === "REJECTED" ? "destructive" : "outline"}
                            size="sm"
                            disabled={isUpdating || application.status === "REJECTED"}
                            onClick={handleReject}
                            className="gap-1 text-xs text-rose-600 hover:text-white hover:bg-rose-600 border-rose-200 disabled:opacity-50"
                        >
                            <X className="w-3.5 h-3.5" /> Reject
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
});
