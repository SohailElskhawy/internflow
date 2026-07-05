"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { X, ExternalLink, Download, GraduationCap, BookOpen, Wrench } from "lucide-react";

export interface StudentProfileData {
    id: string;
    university: string;
    major: string;
    skills: string[];
    cvUrl?: string | null;
    user: {
        id: string;
        name: string;
        email: string;
    };
}

interface StudentProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: StudentProfileData | null;
}

export const StudentProfileModal = memo(function StudentProfileModal({
    isOpen,
    onClose,
    student,
}: StudentProfileModalProps) {
    if (!isOpen || !student) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-background rounded-xl shadow-2xl border overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b bg-muted/20">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">
                            {student.user.name}
                        </h2>
                        <p className="text-sm text-muted-foreground">{student.user.email}</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="rounded-full hover:bg-muted"
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Content Body */}
                <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                    {/* Education */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider">
                            <GraduationCap className="w-4 h-4" /> Education
                        </div>
                        <div className="bg-muted/40 p-4 rounded-lg space-y-1">
                            <p className="font-semibold text-foreground">{student.university}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <BookOpen className="w-3.5 h-3.5" /> Major: {student.major}
                            </p>
                        </div>
                    </div>

                    {/* Skills */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider">
                            <Wrench className="w-4 h-4" /> Skills
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {student.skills && student.skills.length > 0 ? (
                                student.skills.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                                    >
                                        {skill}
                                    </span>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No skills listed.</p>
                            )}
                        </div>
                    </div>

                    {/* Resume / CV */}
                    <div className="space-y-3 border-t pt-4">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                            Resume / Documents
                        </h4>
                        {student.cvUrl ? (
                            <a
                                href={student.cvUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-between w-full p-3 border rounded-lg hover:bg-muted/50 transition-colors text-sm font-medium text-primary"
                            >
                                <span className="flex items-center gap-2">
                                    <Download className="w-4 h-4" /> Download CV / Resume
                                </span>
                                <ExternalLink className="w-4 h-4 text-muted-foreground" />
                            </a>
                        ) : (
                            <p className="text-sm text-muted-foreground italic">No CV uploaded by applicant.</p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-muted/20 flex justify-end">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
});
