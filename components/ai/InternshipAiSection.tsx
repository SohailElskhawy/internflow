"use client";

import React, { useState, useCallback } from "react";
import { MissingSkillsCard } from "./MissingSkillsCard";
import { CoverLetterModal } from "./CoverLetterModal";
import { InterviewPrepModal } from "./InterviewPrepModal";

interface InternshipAiSectionProps {
  internshipId: string;
}

export const InternshipAiSection: React.FC<InternshipAiSectionProps> = React.memo(({ internshipId }) => {
  const [isCoverLetterOpen, setIsCoverLetterOpen] = useState(false);
  const [isInterviewPrepOpen, setIsInterviewPrepOpen] = useState(false);

  const handleOpenCoverLetter = useCallback(() => {
    setIsCoverLetterOpen(true);
  }, []);

  const handleCloseCoverLetter = useCallback(() => {
    setIsCoverLetterOpen(false);
  }, []);

  const handleOpenInterviewPrep = useCallback(() => {
    setIsInterviewPrepOpen(true);
  }, []);

  const handleCloseInterviewPrep = useCallback(() => {
    setIsInterviewPrepOpen(false);
  }, []);

  return (
    <div className="space-y-4">
      <MissingSkillsCard
        internshipId={internshipId}
        onOpenCoverLetterModal={handleOpenCoverLetter}
        onOpenInterviewPrepModal={handleOpenInterviewPrep}
      />

      <CoverLetterModal
        isOpen={isCoverLetterOpen}
        onClose={handleCloseCoverLetter}
        internshipId={internshipId}
      />

      <InterviewPrepModal
        isOpen={isInterviewPrepOpen}
        onClose={handleCloseInterviewPrep}
        internshipId={internshipId}
      />
    </div>
  );
});

InternshipAiSection.displayName = "InternshipAiSection";
